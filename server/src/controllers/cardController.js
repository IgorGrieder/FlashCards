import { Router } from "express";
import Utils from "../utils/utils.js";
import CollectionService from "../services/collectionService.js";

const cardRoutes = new Router();

/**
 * Middleware to validate the request payload for adding a card to a collection.
 *
 * This middleware ensures that all required fields (`answer`, `category`, and `question`)
 * are present in the `card` object of the request body. If any of these fields are missing,
 * it sends a `400 Bad Request` response with an appropriate error message.
 *
 * @function validateCardToCollection
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.body.card - The flashcard details.
 * @param {string} req.body.card.answer - The answer for the flashcard (required).
 * @param {string} req.body.card.category - The category of the flashcard (required).
 * @param {string} req.body.card.question - The question for the flashcard (required).
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @returns {void}
 * - If validation passes, it calls the `next()` function to proceed to the next middleware or route handler.
 * - If validation fails, it returns a `400 Bad Request` response.
 *
 * @response {number} 400 - Indicates a bad request due to missing fields in the `card` object.
 * @responseBody {boolean} cardAdded - Always `false` when validation fails.
 * @responseBody {string} message - An error message specifying that required fields are missing.
 *
 * @example
 * // Request with missing fields
 * POST /add-card
 * {
 *   "card": {
 *     "answer": "42",
 *     "category": "Trivia"
 *     // Missing "question"
 *   },
 *   "collectionName": "My Trivia Collection"
 * }
 *
 * // Response
 * 400 Bad Request
 * {
 *   "cardAdded": false,
 *   "message": "Answer/category/question are required."
 * }
 *
 * @example
 * // Request with all fields present
 * POST /add-card
 * {
 *   "card": {
 *     "answer": "42",
 *     "category": "Trivia",
 *     "question": "What is the answer to life, the universe, and everything?"
 *   },
 *   "collectionName": "My Trivia Collection"
 * }
 *
 * // Middleware passes, next() is called, and request proceeds.
 */
const validateCardToCollection = (req, res, next) => {
  const { answer, category, question } = req.body.card;

  if (!answer || !category || !question) {
    return res.status(400).json({
      cardAdded: false,
      message: "Answer/category/question are required.",
    });
  }

  next();
};

/**
 * Middleware to validate the required fields for creating a new collection.
 *
 * This middleware checks if the `name` and `category` fields are present in the request body.
 * If either field is missing, it returns a 400 Bad Request response with an error message.
 * Otherwise, it passes control to the next middleware or route handler.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.name - The name of the collection to be created.
 * @param {string} req.body.category - The category of the collection to be created.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware or route handler in the stack.
 * @returns {Object} 400 - If `name` or `category` is missing.
 *
 * @example
 * // Example invalid request body
 * {
 *   "name": "My Collection"
 *   // Missing "category"
 * }
 *
 * // Example response (400)
 * {
 *   "collectionCreated": false,
 *   "message": "Collection name/category are required."
 * }
 */
const validateCreateCollection = (req, res, next) => {
  const { name, category } = req.body;

  if (!name || !category) {
    return res.status(400).json({
      collectionCreated: false,
      message: "Collection name/category are required.",
    });
  }

  next();
};

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
cardRoutes.get(
  "/get-collections",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
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
  },
);

/**
 * Endpoint to create a new collection for an authenticated user.
 *
 * This route creates a new collection for the authenticated user based on the provided
 * name and category. It uses middleware to validate required fields and the JWT token.
 * On success, it responds with a message confirming the collection creation.
 *
 * @route POST /cards/create-collection
 * @middleware {function} validateCreateCollection - Validates the request body fields.
 * @middleware {function} Utils.validateJWTMiddlewear - Validates the JWT token from the request headers.
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.name - The name of the new collection.
 * @param {string} req.body.category - The category of the new collection.
 * @param {Object} req.body.decoded - The decoded JWT payload.
 * @param {string} req.body.decoded.userId - The user ID from the decoded token.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} 201 - Confirmation that the collection was created successfully.
 * @returns {Object} 400 - If required fields are missing (handled by middleware).
 * @returns {Object} 500 - If an unexpected server error occurs.
 *
 * @example
 * // Request headers
 * {
 *   "Authorization": "Bearer <JWT>"
 * }
 *
 * // Example request body
 * {
 *   "name": "My Flashcards",
 *   "category": "Education"
 * }
 *
 * // Example success response (201)
 * {
 *   "collectionCreated": true,
 *   "message": "Your collection was created successfully."
 * }
 *
 * // Example error response (500)
 * {
 *   "collectionCreated": false,
 *   "message": "An unexpected error occurred."
 * }
 */
cardRoutes.post(
  "/create-collection",
  validateCreateCollection,
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { userId } = req.body.decoded;
    const { name, category } = req.body;
    const result = await CollectionService.createCollection(
      category,
      name,
      userId,
    );

    if (result.success) {
      return res.status(201).json({
        collectionCreated: true,
        message: "Your collection was created successfully.",
      });
    }

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        collectionCreated: false,
        message: "An unexpected error occurred.",
      });
    }
  },
);

/**
 * Adds a new card to a specified collection.
 *
 * This endpoint allows users to add a new flashcard to a specific collection they own.
 * The user must provide the card details (answer, category, question, and optional image)
 * and the name of the collection where the card should be added.
 *
 * @route PATCH /add-card
 * @middleware Utils.validateJWTMiddlewear - Validates the JWT token to authenticate the user.
 * @middleware validateCardToCollection - Validates the request payload for card and collection details.
 * @access Protected
 *
 * @requestBody {Object} req.body - The request payload.
 * @requestBody {Object} req.body.decoded - Decoded JWT payload containing user information.
 * @requestBody {string} req.body.decoded.userId - The ID of the authenticated user.
 * @requestBody {Object} req.body.card - The flashcard details.
 * @requestBody {string} req.body.card.answer - The answer for the flashcard.
 * @requestBody {string} req.body.card.category - The category of the flashcard.
 * @requestBody {string} req.body.card.question - The question for the flashcard.
 * @requestBody {string} [req.body.card.img] - Optional image URL for the flashcard.
 * @requestBody {string} req.body.collectionName - The name of the collection to which the card will be added.
 *
 * @response {Object} res - The response object.
 * @response {number} 201 - Indicates that the card was successfully added to the collection.
 * @responseBody {boolean} cardAdded - Confirms that the card was added successfully.
 * @responseBody {string} message - A success message.
 *
 * @response {number} 500 - Indicates an internal server error.
 * @responseBody {boolean} collectionCreated - Always `false` for internal server errors.
 * @responseBody {string} message - An error message explaining the issue.
 *
 * @example
 * // Request
 * PATCH /add-card
 * Authorization: Bearer <JWT_TOKEN>
 * {
 *   "card": {
 *     "answer": "42",
 *     "category": "Trivia",
 *     "question": "What is the answer to life, the universe, and everything?",
 *     "img": "https://example.com/image.png"
 *   },
 *   "collectionName": "My Trivia Collection"
 * }
 *
 * // Success Response
 * 201 Created
 * {
 *   "cardAdded": true,
 *   "message": "Card added to your collection"
 * }
 *
 * // Error Response (Internal Server Error)
 * 500 Internal Server Error
 * {
 *   "collectionCreated": false,
 *   "message": "An unexpected error occurred."
 * }
 */
cardRoutes.patch(
  "/add-card",
  Utils.validateJWTMiddlewear,
  validateCardToCollection,
  async (req, res) => {
    const { userId } = req.body.decoded;
    const { answer, category, question, img } = req.body.card;
    const { collectionName } = req.body;

    const result = await CollectionService.addCardToCollection(
      answer,
      category,
      question,
      userId,
      img,
      collectionName,
    );

    if (result.success) {
      return res.status(201).json({
        cardAdded: true,
        message: "Card added to your collection",
      });
    }

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        collectionCreated: false,
        message: "An unexpected error occurred.",
      });
    }
  },
);
export default cardRoutes;
