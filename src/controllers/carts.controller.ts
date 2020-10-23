import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import CartModel from "../models/cartModel";
import GameModel from "../models/gameModel";

export function show(cartModel: CartModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const id = new ObjectID(request.params.id);
    const cart = await cartModel.findById(id);
    if (cart?.isCurrent) {
      response.render("pages/cart", { cart });
    } else if (cart !== null && !cart.isCurrent) {
      cartModel.findAll();
    } else {
      response.status(404).render("pages/not-found");
    }
  };
}
// export function addGame(cartModel : CartModel, gameModel: GameModel){

// }
// export function create(cartModel: CartModel, gameModel: GameModel) {
//   return async (request: Request, response: Response): Promise<void> => {
//     // If we're getting JSON

//       const cart = await cartModel.insertGame(request.body.game)

//       if (platforms.length > 0) {
//         // Update Games in the related platforms
//         for await (const platform of platforms) {
//           await platformModel.addGame(platform, game);
//         }
//       }

//       if (request.get("Content-Type") === "application/json") {
//         response.status(201).json(game);
//       } else if (request.get("Content-Type") === "application/x-www-form-urlencoded") {
//         response.redirect(`/games/${game.slug}`);
//       }
//     }
//   };
// }
