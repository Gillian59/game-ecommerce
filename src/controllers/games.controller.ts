import { Request, Response } from "express";
import PlatformModel from "../models/platformModel";
import slugify from "slug";
import GameModel from "../models/gameModel";

const clientWantsJson = (request: Request): boolean => request.get("accept") === "application/json";

export function index(gameModel: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const games = await gameModel.findAll();
    if (clientWantsJson(request)) {
      response.json(games);
    } else {
      response.render("games/index", { games });
    }
  };
}

export function newGame() {
  return async (request: Request, response: Response): Promise<void> => {
    response.render("games/new", { action: "/games", callToAction: "Create" });
  };
}

export function show(gameModel: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const game = await gameModel.findBySlug(request.params.slug);
    if (game) {
      if (clientWantsJson(request)) {
        response.json(game);
      } else {
        game.first_release_date = new Date((game.first_release_date as number) * 1000).getTime();
        response.render("games/show", { game });
      }
    } else {
      response.status(404);
      if (clientWantsJson(request)) {
        response.json({ error: "This game does not exist." });
      } else {
        response.status(404).render("pages/not-found");
      }
    }
  };
}

export function list(gameModel: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const games = await gameModel.findByPlatformSlug(request.params.slug);
    if (clientWantsJson(request)) {
      response.json(games);
    } else {
      response.render("games/index", { games });
    }
  };
}

export function create(gameModel: GameModel, platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    // If we're getting JSON

    const slug = slugify(request.body.name);
    const errors = gameModel.validate({ ...request.body, slug: slug });
    if (errors.length > 0) {
      response.status(400).json({ errors });
    } else {
      const { cover_url, platform_slugs, ...gameInput } = request.body;
      gameInput.cover = { url: cover_url };
      gameInput.slug = slug;

      const platformSlugs: string[] =
        typeof platform_slugs === "string" ? platform_slugs.split(",").map((slug) => slug.trim()) : platform_slugs;

      const platforms = (
        await Promise.all(platformSlugs.map((slug) => platformModel.findBySlug(slug)))
      ).flatMap((platform) => (platform === null ? [] : [platform]));
      // flatMap is used because `findBySlug` can return null, so we get an array of type (Platform | null)[]
      // see https://stackoverflow.com/a/59726888

      const game = await gameModel.insertOne(gameInput, platforms);

      if (platforms.length > 0) {
        // Update Games in the related platforms
        for await (const platform of platforms) {
          await platformModel.addGame(platform, game);
        }
      }

      if (request.get("Content-Type") === "application/json") {
        response.status(201).json(game);
      } else if (request.get("Content-Type") === "application/x-www-form-urlencoded") {
        response.redirect(`/games/${game.slug}`);
      }
    }
  };
}

export function edit(gameModel: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const game = await gameModel.findBySlug(request.params.slug);
    if (game) {
      response.render("games/edit", { game, action: `/games/${game.slug}`, callToAction: "Save" });
    } else {
      response.status(404);
      response.status(404).render("pages/not-found");
    }
  };
}

export function update(gameModel: GameModel, platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const game = await gameModel.findBySlug(request.params.slug);
    if (game) {
      if (request.get("Content-Type") === "application/json") {
        // If we're getting JSON
        const errors = gameModel.validate({ ...request.body, slug: request.params.slug });
        if (errors.length > 0) {
          response.status(400).json({ errors });
        } else {
          const updatedGame = await gameModel.updateOne(game._id, { ...game, ...request.body, _id: game._id });
          response.status(201).json(updatedGame);
        }
      } else if (request.get("Content-Type") === "application/x-www-form-urlencoded") {
        // If we're in a Form
        console.log(request.body);
        const { cover_url, platform_slugs, ...gameInput } = request.body;
        gameInput.cover = { url: cover_url };

        const platformSlugs: string[] =
          typeof platform_slugs === "string" ? platform_slugs.split(",").map((slug) => slug.trim()) : platform_slugs;
        const platforms = (
          await Promise.all(platformSlugs.map((slug) => platformModel.findBySlug(slug)))
        ).flatMap((platform) => (platform === null ? [] : [platform]));
        // flatMap is used because `findBySlug` can return null, so we get an array of type (Platform | null)[]
        // see https://stackoverflow.com/a/59726888

        const updatedGame = await gameModel.updateOne(game._id, { ...game, ...gameInput, _id: game._id }, platforms);
        if (platforms.length > 0) {
          // Update Games in the related platforms
          for await (const platform of platforms) {
            await platformModel.addGame(platform, updatedGame);
          }
        }
        response.redirect(`/games/${updatedGame.slug}`);
      }
    } else {
      response.status(404).end();
    }
  };
}

export function destroy(gameModel: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const game = await gameModel.findBySlug(request.params.slug);
    if (game) {
      gameModel.remove(game._id);
      response.status(204).end();
    } else {
      response.status(404).end();
    }
  };
}
