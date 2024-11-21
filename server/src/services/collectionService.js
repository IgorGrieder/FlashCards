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
      console.log(error);
      return { success: false, code: 500 };
    }
  }
}

export default CollectionService;
