import { Router } from "express";
import Utils from "../utils/utils.js";
import CollectionService from "../services/collectionService.js";

const cardRoutes = new Router();

/**
 * Endpoint to fetch collections for an authenticated user.
 *
 * This route uses a middleware to validate the user's JWT token and retrieves collections associated
 * with the authenticated user ID. It responds with the user's collections if found, or an appropriate
 * status if no collections or an error occurs.
 *
 * @route GET /cards/
 * @middleware {function} Utils.validateJWTMiddlewear - Validates the JWT token from the request headers.
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body.decoded - The decoded JWT payload.
 * @param {string} req.body.decoded.userId - The user ID from the decoded token.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} 200 - A list of collections found for the user.
 * @returns {Object} 204 - No content, if the user has no collections.
 * @returns {Object} 500 - An error message if an unexpected server error occurs.
 *
 * @example
 * // Request headers
 * {
 *   "Authorization": "Bearer <JWT>"
 * }
 *
 * // Example successful response (200)
 * {
 *   "collectionsFound": true,
 *   "collections": [
 *     {
 *       "id": "collection1",
 *       "name": "Flashcards for Science",
 *       "owner": "userId123",
 *       "category": "Science",
 *       "cards": [
 *         { "id": "card1", "question": "What is photosynthesis?", "answer": "A process used by plants to convert light into energy." },
 *         { "id": "card2", "question": "What is gravity?", "answer": "A force that attracts two bodies towards each other." }
 *       ]
 *     },
 *     {
 *       "id": "collection2",
 *       "name": "History Facts",
 *       "owner": "userId123",
 *       "category": "History",
 *       "cards": [
 *         { "id": "card3", "question": "Who discovered America?", "answer": "Christopher Columbus." },
 *         { "id": "card4", "question": "When was World War II?", "answer": "1939-1945." }
 *       ]
 *     }
 *   ]
 * }
 *
 * // Example no content response (204)
 * // No body is returned.
 *
 * // Example error response (500)
 * {
 *   "collectionsFound": false,
 *   "message": "An unexpected error occurred."
 * }
 */
cardRoutes.get("/", Utils.validateJWTMiddlewear, async (req, res) => {
  const { userId } = req.body.decoded;
  const result = await CollectionService.getUserCollections(userId);

  if (result.success) {
    return res.status(200).json({
      collectionsFound: true,
      collections: result.collections,
    });
  }

  // No content
  if (result.code === 204) {
    return res.status(204).send();
  }

  // Internal server error
  if (result.code === 500) {
    return res.status(500).json({
      collectionsFound: false,
      message: "An unexpected error occurred.",
    });
  }
});

cardRoutes.post("");
export default cardRoutes;
