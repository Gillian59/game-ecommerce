import { Collection, ObjectId } from "mongodb";
import { Game } from "./gameModel";

export type Cart = {
  _id: ObjectId;
  games: [];
  user: string;
  totalPrice: number;
  isCurrent: boolean;
};

export default class CartModel {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  async insertGame(game: Game): Promise<Game> {
    const dbResponse = await this.collection.insertOne(game);
    const { ops } = dbResponse;
    return ops[0];
  }

  async remove(user: string): Promise<void> {
    await this.collection.deleteOne({ user });
  }

  findAll(): Promise<Cart[]> {
    return this.collection.find().toArray();
  }

  findById(_id: ObjectId): Promise<Cart | null> {
    return this.collection.findOne({ _id });
  }
}
