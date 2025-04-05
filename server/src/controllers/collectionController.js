import { Router } from "express";
import Utils from "../utils/utils.js";
import CollectionService from "../services/collectionService.js";
import { collectionCreated, deletedCollection, errorCreateCollection, incompleteReqInfo, unexpectedError } from "../constants/messageConstants.js";
import { badRequest, created, internalServerErrorCode, noContentCode } from "../constants/codeConstants.js";

// Router instance
const collectionRoutes = new Router();

const validateCreateCollection = (req, res, next) => {
  const { name, category } = req.body;

  // if any of the given requirements aren't given we must return a bad call
  if (!name || !category) {
    return res.status(badRequest).json({
      collectionCreated: false,
      message: incompleteReqInfo,
    });
  }

  next();
};

collectionRoutes.get('/collections/:collectionId', async (req, res) => {
  try {
    const images = await CollectionService.getImages(req.params.collectionId);

    console.log(images);

    if (!images) {
      return res.status(404).send('Collection not found');
    }

    res.setHeader('Content-Type', 'multipart/mixed; boundary="BOUNDARY"');

    for (const { cardId, stream } of images) {
      if (!stream) continue;

      res.write(`--BOUNDARY\r\n`);
      res.write(`Content-Type: ${stream.contentType}\r\n`);
      res.write(`Content-ID: ${cardId}\r\n\r\n`);

      for await (const chunk of stream) {
        res.write(chunk);
      }

      res.write('\r\n');
    }

    res.write('--BOUNDARY--\r\n');
    console.log(res);
    res.end();
    res.status(200).send();

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

collectionRoutes.get(
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

collectionRoutes.post(
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

collectionRoutes.post(
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

export default collectionRoutes
