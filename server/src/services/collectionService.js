import collectionModel from "../models/collectionModel.js";

class CollectionService {
  /**
   * Retrieves the collections owned by a specific user.
   *
   * This method interacts with the database to fetch all collections associated with the provided user ID.
   * If no collections are found, it returns a success status with no data. If an error occurs, it returns
   * a failure response with the appropriate HTTP status code.
   *
   * @async
   * @function getUserCollections
   * @memberof CollectionService
   * @param {string} userId - The ID of the user whose collections are being retrieved.
   * @returns {Promise<Object>} An object containing:
   * - `success` {boolean} - Indicates whether the collections were successfully retrieved.
   * - `code` {number} [optional] - HTTP status code indicating the outcome:
   *   - 204: No content, no collections found.
   *   - 500: Internal server error.
   * - `collections` {Array<Object>} [optional] - The list of collections if retrieval was successful.
   *
   * @example
   * // Example usage
   * const result = await CollectionService.getUserCollections("userId123");
   *
   * if (result.success) {
   *   console.log(result.collections);
   * } else if (result.code === 204) {
   *   console.log("No collections found.");
   * } else {
   *   console.log("An error occurred.");
   * }
   */
  static async getUserCollections(userId) {
    try {
      const collections = await collectionModel.find({ owner: userId });

      if (!collections.length > 0) {
        return { success: false, code: 204 };
      }

      return { success: true, collections };
    } catch (error) {
      return { success: false, code: 500 };
    }
  }

  static async createCollection(category, name, userId) {
    try {
      const newCollection = await collectionModel.create({
        name,
        owner: userId,
        category,
        cards: [],
      });

      if (!newCollection) {
        return { success: false, code: 500 };
      }

      return { success: true, code: 201 };
    } catch (error) {
      return { success: false, code: 500 };
    }
  }

  /**
 * Deletes a collection identified by its ID.
 *
 * This method removes a specified collection from the database by its unique identifier.
 * If the operation is successful, it returns a confirmation; otherwise, it handles various failure scenarios.
 *
 * @async
 * @function
 * @param {string} collectionId - The unique identifier of the collection to be deleted.
 * @returns {Promise<Object>} The result of the operation.
 * @returns {boolean} result.success - Indicates whether the collection was successfully deleted.
 * @returns {number} result.code - The HTTP-like status code representing the outcome.
 *
 * - `201`: Collection successfully deleted.
 * - `500`: An unexpected server error occurred during the operation.
 *
 * @example
 * // Call the function
 * const result = await CollectionService.deleteCollection("60d21b4667d0d8992e610c85");
 *
 * // Success response
 * {
 *   success: true,
 *   code: 204
 * }
 *
 * // Failure response (server error)
 * {
 *   success: false,
 *   code: 500
 * }
 */
  static async deleteCollection(collectionId) {
    try {
      const result = await collectionModel.findByIdAndDelete(collectionId)
      if (result.deletedCount === 0) {
        return { success: false, code: 404, message: "Collection not found" };
      }

      return { success: true, code: 204 };
    } catch (error) {
      return { success: false, code: 500, message: "Internal server error" };
    }
  }

  /**
   * Adds a new card to a specified collection owned by a user.
   *
   * This method creates a new card object based on the provided details (answer, question, category, and optional image)
   * and adds it to the `cards` array of the specified collection belonging to the user. If the operation is successful,
   * it returns a confirmation; otherwise, it handles various failure scenarios.
   *
   * @async
   * @function
   * @param {string} answer - The answer text for the flashcard.
   * @param {string} category - The category of the flashcard.
   * @param {string} question - The question text for the flashcard.
   * @param {string} userId - The ID of the user who owns the collection.
   * @param {string} [img] - Optional image URL associated with the flashcard.
   * @param {string} collectionName - The name of the collection to which the card will be added.
   * @returns {Promise<Object>} The result of the operation.
   * @returns {boolean} result.success - Indicates if the card was successfully added.
   * @returns {number} result.code - The HTTP-like status code representing the outcome.
   *
   * - `203`: Card successfully added to the collection.
   * - `400`: The specified collection was not found or the card could not be added.
   * - `500`: An unexpected server error occurred.
   *
   * @example
   * // Call the function
   * const result = await CollectionService.addCardToCollection(
   *   "42",
   *   "Trivia",
   *   "What is the answer to life, the universe, and everything?",
   *   "12345",
   *   "https://example.com/image.png",
   *   "My Trivia Collection"
   * );
   *
   * // Success response
   * {
   *   success: true,
   *   code: 203
   * }
   *
   * // Failure response (collection not found)
   * {
   *   success: false,
   *   code: 400
   * }
   *
   * // Failure response (server error)
   * {
   *   success: false,
   *   code: 500
   * }
   */
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

      const collectionToAdd = await collectionModel.findById(collectionId);

      if (collectionToAdd) {
        collectionToAdd.cards.push(newCard);

        await collectionToAdd.save();

        const cardAdded = collectionToAdd.cards(collectionToAdd.cards.length - 1)
        return {
          success: true,
          code: 203,
          cardAdded
        }
      }

      return { success: false, code: 400 };
    } catch (error) {
      return { success: false, code: 500 };
    }
  }

  /**
   * Deletes a card from the specified collection of a user.
   *
   * This method finds the collection owned by the user and removes the card with the given
   * `question` and `category` from the collection's `cards` array.
   *
   * @function deleteCardFromCollection
   * @param {string} category - The category of the card to delete (required).
   * @param {string} question - The question of the card to delete (required).
   * @param {string} userId - The ID of the user requesting the deletion (required).
   * @param {string} collectionName - The name of the collection from which the card will be deleted (required).
   *
   * @returns {Object} success - An object indicating the success or failure of the operation.
   * @returns {boolean} success.success - `true` if the card was successfully deleted.
   * @returns {number} success.code - HTTP status code for the operation.
   *
   * @response {Object} 204 - Successfully deleted card (no content).
   * @response {Object} 500 - Internal server error if the deletion fails.
   *
   * @example
   * // Request to delete a card from a collection
   * deleteCardFromCollection("Programming", "What is Node.js?", "user123", "Tech Cards");
   *
   * // Returns
   * {
   *   success: true,
   *   code: 204
   * }
   */
  static async deleteCardFromCollection(
    category,
    question,
    userId,
    collectionName,
  ) {
    try {
      await collectionModel.findOneAndUpdate(
        {
          owner: userId,
          name: collectionName,
        },
        {
          $pull: { cards: { category, question } },
        },
      );

      return {
        success: true,
        code: 204,
      };
    } catch (error) {
      return { success: false, code: 500 };
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
      const collection = await collectionModel.findById(collectionId);
      if (!collection) {
        return { success: false, code: 404, message: 'Collection not found' };
      }

      let wasFound = false;

      // Iterate through the cards array to find the specific card
      collection.cards.forEach((card) => {
        if (card._id.toString() === cardId.toString()) {
          wasFound = true;
          if (answer) {
            card.answer = answer;
          }
          if (img) {
            card.img = { data: img.base64, contentType: img.type };
          }
          if (question) {
            card.question = question;
          }
          if (category) {
            card.category = category;
          }
        }
      });

      if (!wasFound) {
        return { success: false, code: 404, message: 'Card not found' };
      }

      // Save the updated collection
      await collection.save();
      return { success: true, code: 204 };
    } catch (error) {
      console.error('Error updating card:', error);
      return { success: false, code: 500, message: 'Internal server error' };
    }
  }
}
export default CollectionService;
