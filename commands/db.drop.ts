import initDb from "../utils/initDatabase";
import dropDb from "../utils/dropDatabase";

initDb()
  .then(async (client) => {
    const db = client.db();

    await dropDb(db);

    client.close();
  })
  .catch(console.error);
