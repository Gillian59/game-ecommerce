import { makeApp } from "./server";
import * as dotenv from "dotenv";
import initDb from "../utils/initDatabase";

dotenv.config();

initDb()
  .then(async (client) => {
    const app = makeApp(client.db());

    app.listen(process.env.PORT, () => {
      console.log(`listen on http://localhost:${process.env.PORT}`);
    });
  })
  .catch(console.error);
