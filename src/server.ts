import { MongoClient } from "mongodb";
import * as core from "express-serve-static-core";
import express from "express";
import * as gamesController from "./controllers/games.controller";
import * as nunjucks from "nunjucks";
import * as platformsController from "./controllers/platforms.controller";
import * as cartController from "./controllers/carts.controller";
import GameModel, { Game } from "./models/gameModel";
import PlatformModel, { Platform } from "./models/platformModel";
import CartModel, { Cart } from "./models/cartModel";
import bodyParser from "body-parser";
import session from "express-session";
import mongoSession from "connect-mongo";
import OAuth2Client, { OAuth2ClientConstructor, decodeJWTPart } from "@fwl/oauth2";
import * as dotenv from "dotenv";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded({ extended: true });

export function makeApp(mongoClient: MongoClient): core.Express {
  const app = express();
  const db = mongoClient.db();
  dotenv.config();

  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });

  const mongoStore = mongoSession(session);
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  const sessionParser = session({
    secret: `${process.env.EXPRESS_SECRET}`,
    name: "sessionId",
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
      client: mongoClient,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 3600000),
    },
  });

  const oauthClientConstructorProps: OAuth2ClientConstructor = {
    openIDConfigurationURL: `${process.env.openIDConfigurationURL}`,
    clientID: `${process.env.clientID}`,
    clientSecret: `${process.env.clientSecret}`,
    redirectURI: `${process.env.redirectURI}`,
    audience: `${process.env.audience}`,
    scopes: ["email"],
  };

  const oauthClient = new OAuth2Client(oauthClientConstructorProps);

  app.use("/assets", express.static("public"));
  app.set("view engine", "njk");

  const platformModel = new PlatformModel(db.collection<Platform>("platforms"));
  const gameModel = new GameModel(db.collection<Game>("games"));
  const cartModel = new CartModel(db.collection<Cart>("cart"));

  const urlAuth = async (): Promise<URL> => {
    return await oauthClient.getAuthorizationURL();
  };

  app.get("/", async (req, res) => {
    await gamesController.showRandom(gameModel);
    const url = await urlAuth();
    res.render("pages/home", {
      login_url: url.toString(),
    });
  });

  app.get("/oauth/callback", sessionParser, async (request, response) => {
    const tokens = await oauthClient.getTokensFromAuthorizationCode(`${request.query.code}`);
    console.log(tokens);
    const decoded = await oauthClient.verifyJWT(tokens.access_token, "RS256");
    console.log(decoded);
    console.log(request.session);
    const [header, payload] = tokens.access_token.split(".");

    const decodedHeader = decodeJWTPart(header);
    const decodedPayload = decodeJWTPart(payload);
    console.log(decodedHeader);
    console.log(decodedPayload);
    if (request.session) {
      request.session.accessToken = tokens.access_token;
    } else {
      console.log("warning, couldn't put the tokens in session");
    }
    response.redirect("http://localhost:8080/");
  });

  app.get("/api", (_request, response) => response.render("pages/api"));
  app.get("/sign-up", (_request, response) => response.render("pages/sign-up"));
  app.get("/login", (_request, response) => response.render("pages/login"));
  app.get("/cart", cartController.show(cartModel));
  //app.post("/cart", cartController.create(cartModel));
  app.get("/checkout", (_request, response) => response.render("pages/checkout"));

  app.get("/platforms", platformsController.index(platformModel));
  app.get("/platforms/new", platformsController.newPlatform());
  app.get("/platforms/:slug", platformsController.show(platformModel));
  app.get("/platforms/:slug/edit", platformsController.edit(platformModel));
  app.post("/platforms", jsonParser, formParser, platformsController.create(platformModel));
  app.put("/platforms/:slug", jsonParser, platformsController.update(platformModel));
  app.post("/platforms/:slug", formParser, platformsController.update(platformModel));
  app.delete("/platforms/:slug", jsonParser, platformsController.destroy(platformModel));

  app.get("/platforms/:slug/games", gamesController.list(gameModel));
  app.get("/games", gamesController.index(gameModel));
  app.get("/games/new", gamesController.newGame());
  app.get("/games/:slug", gamesController.show(gameModel));
  app.get("/games/:slug/edit", gamesController.edit(gameModel));
  app.post("/games", jsonParser, formParser, gamesController.create(gameModel, platformModel));
  app.put("/games/:slug", jsonParser, gamesController.update(gameModel, platformModel));
  app.post("/games/:slug", formParser, gamesController.update(gameModel, platformModel));
  app.delete("/games/:slug", jsonParser, gamesController.destroy(gameModel));

  app.get("/*", (request, response) => {
    console.log(request.path);
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      response.status(404).render("pages/not-found");
    }
  });

  return app;
}
