import { Router } from "express";
import Utils from "../utils/utils.js";
import CollectionService from "../services/collectionService.js";
import { cardAdded, collectionCreated, deletedCollection, errorAddCard, errorCreateCollection, incompleteReqInfo, unexpectedError } from "../constants/messageConstants.js";
import { badRequest, created, internalServerErrorCode, noContentCode } from "../constants/codeConstants.js";

// Router instance
const cardRoutes = new Router();

// Middlewares ----------------------------------------------------------------
const validateCardToDelete = (req, res, next) => {
  const { question, category, collectionName } = req.body.card;

  // if any of the given requirements aren't given we must return a bad call
  if (!question || !category || !collectionName) {
    return res.status(badRequest).json({
      collectionCreated: false,
      message: incompleteReqInfo,
    });
  }

  next();
};

const validateCreateCollection = (req, res, next) => {
  const { name, category } = req.body;

  if (!name || !category) {
    return res.status(badRequest).json({
      collectionCreated: false,
      message: incompleteReqInfo,
    });
  }

  next();
};

// Routes ---------------------------------------------------------------------
cardRoutes.get(
  "/get-collections",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { userId } = req.body.decoded;
    const result = await CollectionService.getUserCollections(userId);

    if (result.success) {
      return res.status(result.code).json({
        collectionsFound: true,
        collections: result.collections,
      });
    }

    // No content
    if (result.code === noContentCode) {
      return res.status(result.code).send();
    }

    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
        collectionsFound: false,
        message: unexpectedError,
      });
    }
  },
);

cardRoutes.delete(
  "/delete-collection",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { collectionId } = req.body;
    const result = await CollectionService.deleteCollection(collectionId);

    if (result.success) {
      return res.status(result.code).json({
        collectionDeleted: true,
        message: deletedCollection,
      });
    }

    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
        collectionDeleted: true,
        message: unexpectedError,
      });
    }

    return res.status(badRequest).json({
      collectionDeleted: true,
      message: errorCreateCollection,
    });

  }
)

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
      return res.status(created).json({
        collectionCreated: true,
        message: collectionCreated,
        collection: result.collection
      });
    }

    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
        collectionCreated: false,
        message: unexpectedError,
      });
    }

    return res.status(badRequest).json({
      collectionCreated: false,
      message: errorCreateCollection,
    });
  },
);

cardRoutes.patch(
  "/delete-card",
  Utils.validateJWTMiddlewear,
  validateCardToDelete,
  async (req, res) => {
    const { userId } = req.body.decoded;
    const { category, question, collectionName } = req.body.card;

    const result = await CollectionService.deleteCardFromCollection(
      category,
      question,
      userId,
      collectionName,
    );

    if (result.success) {
      return res.status(204);
    }

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        collectionCreated: false,
        message: unexpectedError,
      });
    }
  },
);

cardRoutes.patch(
  "/update-card",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { cardId, collectionId } = req.body.card;
    const { question, category, img, answer } = req.body.newCard;

    const result = await CollectionService.updateCardFromCollection(
      answer,
      category,
      question,
      img,
      collectionId,
      cardId
    );

    if (result.success) {
      return res.status(204).json({ cardUpdated: true });
    }

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        cardUpdated: false,
        message: unexpectedError,
      });
    }
  },
);

cardRoutes.post(
  "/add-card",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { answer, category, question, img } = req.body.card;
    const { collectionId } = req.body;

    const result = await CollectionService.addCardToCollection(
      answer,
      category,
      question,
      img,
      collectionId,
    );

    if (result.success) {
      return res.status(201).json({
        cardAdded: true,
        message: cardAdded,
        card: result.cardAdded
      });
    }

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        cardAdded: false,
        message: unexpectedError,
      });
    }

    return res.status(400).json({
      cardAdded: false,
      message: errorAddCard,
    });
  },
);

export default cardRoutes;
