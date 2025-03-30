import { DBCollections } from "../database/collectionsInstances.js"
import { internalServerErrorCode, noContentCode, badRequest, notFoundCode, created } from "../constants/codeConstants.js";
import { ObjectId } from "mongodb";

class CardService {

  /**
     * Adds a new card to a collection
     * @static
     * @async
     * @param {Object} card - The card object to add
     * @param {string} collectionId - MongoDB collection ID as string
     * @returns {Promise<{success: boolean, code: string, newCardId?: import('mongodb').ObjectId}>}
     */
  static async addCardToCollection(
    card,
    collectionId,
  ) {
    try {
      // Adding an ObjectID for the card
      card._id = new ObjectId();
      console.log("Searching for collection:", collectionId);
      console.log("Exists?", await DBCollections().findOne({ _id: new ObjectId(collectionId) }));

      const collectionModified = await DBCollections().findOneAndUpdate(
        { _id: new ObjectId(collectionId) },
        { $push: { cards: card } },
        { returnDocument: 'after' });

      if (!collectionModified) {
        return { success: false, code: badRequest };
      }

      return { success: true, code: created, newCardId: card._id }
    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode };
    }
  }

  /**
     * Deletes a card from a collection
     * @static
     * @async
     * @param {string} collectionId - MongoDB collection ID as string
     * @param {string} cardId - MongoDB card ID as string
     * @returns {Promise<{success: boolean, code: string}>}
     */
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

  /**
     * Updates an existing card in a collection
     * @static
     * @async
     * @param {Object} card - Card object with updated values
     * @param {string} cardId - MongoDB card ID as string
     * @param {string} collectionId - MongoDB collection ID as string
     * @returns {Promise<{success: boolean, code: string}>}
     */
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
