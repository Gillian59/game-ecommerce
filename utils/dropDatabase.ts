import { Db } from "mongodb";

export default async (db: Db): Promise<void> => {
  const collections = await db.listCollections().toArray();
  const collectionsNames = collections.map((collection) => collection.name);

  if (collectionsNames.length === 0) {
    console.log("No collections to drop.");
  }

  await Promise.all(
    collectionsNames.map(async (name) => {
      await db.collection(name).drop();
      console.log(`Collection '${name}' dropped`);
    }),
  );
};
