import initDb from "../utils/initDatabase";
import transformData from "../utils/transformData";

initDb().then(async (client) => {
  const db = client.db();

  const [gamesWithPtfs, platformsWithGames] = transformData();

  await db.collection("games").insertMany(gamesWithPtfs);
  await db.collection("platforms").insertMany(platformsWithGames);

  console.log("data imported");
  client.close();
});
