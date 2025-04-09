import { Router } from "express";
import Utils from "../utils/utils.js";
import CollectionService from "../services/collectionService.js";
import {
  collectionCreated,
  deletedCollection,
  errorCreateCollection,
  incompleteReqInfo,
  unexpectedError,
} from "../constants/messageConstants.js";
import {
  badRequest,
  created,
  internalServerErrorCode,
  noContentCode,
} from "../constants/codeConstants.js";
import S3 from "../utils/s3Service.js";

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

// Get all images for a collection at once
collectionRoutes.get(
  "/:collectionId/all-images",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const s3 = new S3();

      // Get the collection details to find all card IDs
      const result = await s3.getImages(collectionId);

      if (!result.success) {
        return res.status(404).json({ message: "Collection not found" });
      }

      return res.status(200).json({
        success: true,
        images: result.images,
      });
    } catch (err) {
      console.error("Error getting all collection images:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get a single image by ID (for previews when not cached)
collectionRoutes.get("/image/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    const s3 = new S3();

    // Get the image directly from S3
    const imageData = await s3.getS3ObjectStream(imageId);

    if (!imageData || !imageData.stream) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Set appropriate headers
    res.setHeader(
      "Content-Type",
      imageData.contentType || "application/octet-stream"
    );
    if (imageData.contentLength) {
      res.setHeader("Content-Length", imageData.contentLength);
    }

    // Stream the image data directly to the response
    imageData.stream.pipe(res);
  } catch (err) {
    console.error("Error streaming single image:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error while streaming image" });
    } else {
      res.end();
    }
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
  }
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
);

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
      userId
    );

    if (result.success) {
      return res.status(created).json({
        collectionCreated: true,
        message: collectionCreated,
        collection: result.collection,
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
  }
);

export default collectionRoutes;
