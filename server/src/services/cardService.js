import { DBCollections } from "../database/collectionsInstances.js"
import { internalServerErrorCode, noContentCode, badRequest, notFoundCode } from "../constants/codeConstants.js";
import { ObjectId } from "mongodb";
import { console } from "node:inspector/promises";

class CardService {
  static async addCardToCollection(
    card,
    collectionId,
  ) {
    try {
      // Adding an ObjectID for the card
      card._id = new ObjectId();

      const collectionModified = await DBCollections().findOneAndUpdate(
        { _id: new ObjectId(collectionId) }, { $push: { cards: card } }, {
        returnDocument: 'after'
      });

      if (!collectionModified) {
        return { success: false, code: 400 };
      }

      return { success: true, code: noContentCode }
    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode };
    }
  }

  static async deleteCardFromCollection(
    collectionId, cardId
  ) {
    try {
      const updatedCollection = await DBCollections().findOneAndUpdate({ _id: new ObjectId(collectionId) },
        { $pull: { cards: { _id: new ObjectId(cardId) } } }, {
        returnDocument: 'after'
      })

      if (!updatedCollection) {
        return {
          success: false,
          code: badRequest,
        };
      }

      return {
        success: true,
        code: noContentCode,
      };
    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode };
    }
  }

  static async updateCard(
    card,
    cardId,
    collectionId
  ) {
    try {
      const collectionModified = await DBCollections().findOneAndUpdate(
        {
          _id: new ObjectId(collectionId),
          "cards._id": new ObjectId(cardId)
        },
        {
          $set: {
            "cards.$.topic": card.topic,
            "cards.$.answer": card.answer,
            "cards.$.question": card.question,
          }
        },
        {
          returnDocument: 'after'
        }
      );

      if (!collectionModified) {
        return {
          success: false,
          code: notFoundCode,
          collection: document
        }
      }

      return { success: true, code: noContentCode };
    } catch (error) {
      console.error(error);
      return { success: false, code: internalServerErrorCode };
    }
  }

}

export default CardService
