import { DBCollections } from "../database/collectionsInstances.js"
import { internalServerErrorCode, noContentCode, badRequest, notFoundCode, created } from "../constants/codeConstants.js";
import { ObjectId } from "mongodb";
import S3 from "../utils/s3Service.js"

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
      // First get the card to check if it has an image
      const collection = await DBCollections().findOne({
        _id: new ObjectId(collectionId),
        "cards._id": new ObjectId(cardId)
      });

      if (!collection) {
        return {
          success: false,
          code: badRequest,
        };
      }

      // Find the card in the collection
      const card = collection.cards.find(c => c._id.toString() === cardId);

      // Delete the card's image from S3 if it exists
      if (card) {
        await CardService.deleteImage(cardId);
      }

      const updatedCollection = await DBCollections().findOneAndUpdate(
        { _id: new ObjectId(collectionId) },
        { $pull: { cards: { _id: new ObjectId(cardId) } } },
        { returnDocument: 'after' }
      );

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
      // If the card has a new image, we need to delete the old one first
      if (card.hasNewImage) {
        await CardService.deleteImage(cardId);
      }

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

  /**
   * Inserts an image file into AWS S3
   * @static
   * @async
   * @param {Express.Multer.File} file - The file object from Multer middleware (contains buffer and mimetype)
   * @param {string} fileName - The desired filename for storage in S3
   * @returns {Promise<boolean>} Returns true if upload succeeded, false if failed
   * @example
   * await YourClassName.insertImage(req.file, 'profile-123.jpg');
   */
  static async insertImage(file, fileName) {
    const s3 = new S3();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    }

    return await s3.insertS3(params);
  }

  static async getImage(fileName) {
    const s3 = new S3();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
    }

    return await s3.getS3(params);
  }

  static async deleteImage(fileName) {
    const s3 = new S3();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Delete: {
        Objects: [{ Key: fileName }]
      }
    }

    return await s3.deleteS3(params);
  }
}

export default CardService
