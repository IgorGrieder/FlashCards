import { DBCollections } from "../database/collectionsInstances.js"
import { internalServerErrorCode, created, noContentCode, okCode, badRequest } from "../constants/codeConstants.js";
import { ObjectId } from "mongodb";
import { unexpectedError } from "../constants/messageConstants.js";

class CollectionService {

  static async getUserCollections(userId) {
    try {
      const collections = await DBCollections().find({ owner: userId })

      console.log(collections)
      if (!collections.length > 0) {
        return { success: false, code: noContentCode };
      }

      return { success: true, code: okCode };
    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode };
    }
  }

  static async createCollection(category, name, userId) {
    try {
      const newCollection = await DBCollections().insertOne({
        name,
        owner: userId,
        category,
        cards: []
      })

      if (!newCollection) {
        return { success: false, code: badRequest };
      }

      return { success: true, code: created, collection: newCollection };

    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode };
    }
  }

  static async deleteCollection(collectionId) {
    try {
      const result = await DBCollections().deleteOne({ _id: new ObjectId(collectionId) })

      if (result.deletedCount == 0) {
        return {
          deleted: false,
          message: userNotFound
        }
      }

      return { success: true, code: noContentCode };
    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode, message: unexpectedError };
    }
  }

  static async addCardToCollection(
    answer,
    category,
    question,
    img,
    collectionId,
  ) {
    try {
      const newCard = { answer, category, question };

      // img's are not required for a flash card
      if (img) {
        newCard.img = img;
      }

      // const collectionToAdd = await collectionModel.findById(collectionId);
      //
      // if (collectionToAdd) {
      //   collectionToAdd.cards.push(newCard);
      //
      //   await collectionToAdd.save();
      //
      //   const cardAdded = collectionToAdd.cards(collectionToAdd.cards.length - 1)
      //   return {
      //     success: true,
      //     code: 203,
      //     cardAdded
      //   }
      // }
      //
      return { success: false, code: 400 };
    } catch (error) {
      return { success: false, code: 500 };
    }
  }

  static async deleteCardFromCollection(
    collectionId, cardId
  ) {
    try {
      const updatedCollection = await DBCollections().findOneAndUpdate({ _id: new ObjectId(collectionId) }, { $pull: { cards: { _id: new ObjectId(cardId) } } })
      console.log(updatedCollection);

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

  static async updateCardFromCollection(
    answer,
    category,
    question,
    img,
    collectionId,
    cardId
  ) {
    try {
      // Find the collection by ID
      // const collection = await collectionModel.findById(collectionId);
      // if (!collection) {
      //   return { success: false, code: 404, message: 'Collection not found' };
      // }
      //
      // let wasFound = false;
      //
      // // Iterate through the cards array to find the specific card
      // collection.cards.forEach((card) => {
      //   if (card._id.toString() === cardId.toString()) {
      //     wasFound = true;
      //     if (answer) {
      //       card.answer = answer;
      //     }
      //     if (img) {
      //       card.img = { data: img.base64, contentType: img.type };
      //     }
      //     if (question) {
      //       card.question = question;
      //     }
      //     if (category) {
      //       card.category = category;
      //     }
      //   }
      // });
      //
      // if (!wasFound) {
      //   return { success: false, code: 404, message: 'Card not found' };
      // }
      //
      // // Save the updated collection
      // await collection.save();
      return { success: true, code: 204 };
    } catch (error) {
      console.error('Error updating card:', error);
      return { success: false, code: 500, message: 'Internal server error' };
    }
  }
}
export default CollectionService;
