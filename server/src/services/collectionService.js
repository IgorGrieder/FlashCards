import { DBCollections } from "../database/collectionsInstances.js"
import { internalServerErrorCode, created, noContentCode, okCode, badRequest } from "../constants/codeConstants.js";
import { ObjectId } from "mongodb";
import { unexpectedError } from "../constants/messageConstants.js";

class CollectionService {

  static async getUserCollections(userId) {
    try {
      const collections = (await DBCollections().find({ owner: new ObjectId(userId) }).toArray())

      if (!collections.length > 0) {
        return { success: false, code: noContentCode };
      }

      return { success: true, code: okCode, collections };
    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode };
    }
  }

  static async createCollection(category, name, userId) {
    try {
      const newCollection = await DBCollections().insertOne({
        name,
        owner: new ObjectId(userId),
        category,
        cards: []
      })

      if (!newCollection.acknowledged) {
        return { success: false, code: badRequest };
      }

      // Returning the new collection
      const collection = await DBCollections().findOne({ _id: new ObjectId(newCollection.insertedId) })
      return { success: true, code: created, collection };

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
}

export default CollectionService;
