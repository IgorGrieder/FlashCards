import { Router } from "express";
import Utils from "../utils/utils.js";
import CardService from "../services/cardService.js";
import { cardAdded, collectionNotFound, errorAddCard, errorUpdateCard, incompleteReqInfo, unexpectedError } from "../constants/messageConstants.js";
import { badRequest, internalServerErrorCode, noContentCode } from "../constants/codeConstants.js";

// Router instance
const cardRoutes = new Router();

// Middlewares ----------------------------------------------------------------
const validateCardToDelete = (req, res, next) => {
  const { collectionId, cardId } = req.body;

  // if any of the given requirements aren't given we must return a bad call
  if (!collectionId || !cardId) {
    return res.status(badRequest).json({
      collectionCreated: false,
      message: incompleteReqInfo,
    });
  }

  next();
};

const validateCardToInsert = (req, res, next) => {
  const { answer, topic, question } = req.body.card;
  const collectionId = req.body.collectionId;

  // if any of the given requirements aren't given we must return a bad call
  if (!collectionId || !answer || !topic || !question) {
    return res.status(badRequest).json({
      collectionCreated: false,
      message: incompleteReqInfo,
    });
  }

  next();

}

// Routes ---------------------------------------------------------------------
cardRoutes.patch(
  "/delete-card",
  Utils.validateJWTMiddlewear,
  validateCardToDelete,
  async (req, res) => {
    const { collectionId, cardId } = req.body;

    const result = await CardService.deleteCardFromCollection(collectionId, cardId);

    if (result.success) {
      return res.status(noContentCode).send();
    }

    if (result.code === badRequest) {
      return res.status(result.code).json({
        collectionCreated: false,
        message: collectionNotFound
      })
    }
    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
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
    const card = req.body.card;
    const { cardId, collectionId } = req.body;

    const result = await CardService.updateCard(card, cardId, collectionId);

    if (result.success) {
      return res.status(noContentCode).send();
    }

    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
        cardUpdated: false,
        message: unexpectedError,
      });
    }

    return res.status(badRequest).json({
      cardAdded: false,
      message: errorUpdateCard,
    });

  },
);

cardRoutes.post(
  "/add-card",
  Utils.validateJWTMiddlewear,
  validateCardToInsert,
  async (req, res) => {
    const card = req.body.card;
    const { collectionId } = req.body;

    const result = await CardService.addCardToCollection(
      card,
      collectionId,
    );

    if (result.success) {
      return res.status(result.code).json({
        cardAdded: true,
        message: cardAdded,
        newCard: result.newCard
      });
    }

    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
        cardAdded: false,
        message: unexpectedError,
      });
    }

    return res.status(badRequest).json({
      cardAdded: false,
      message: errorAddCard,
    });
  },
);

export default cardRoutes;
