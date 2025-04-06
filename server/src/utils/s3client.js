import { S3Client, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DBCollections } from "../database/collectionsInstances.js";
import { ObjectId } from "mongodb";

class S3 {
  constructor() {
    this.s3 = new S3Client({
      region: process.env.BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      },
    });
  }

  /**
    * Low-level method to insert an object into S3
    * @async
    * @param {import('@aws-sdk/client-s3').PutObjectCommandInput} params - S3 put object parameters
    * @returns {Promise<boolean>} Returns true if upload succeeded, false if failed
    * @description This method uses the AWS SDK v3 PutObjectCommand to upload files
    * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectcommandinput.html|PutObjectCommandInput}
    * @example
    * await insertS3({
    *   Bucket: 'my-bucket',
    *   Key: 'file.jpg',
    *   Body: buffer,
    *   ContentType: 'image/jpeg'
    * });
    */
  async insertS3(params) {
    try {
      await this.s3.send(new PutObjectCommand(params));
      return true;
    } catch (err) {
      console.error(`S3 Error [${err.$metadata?.httpStatusCode}]:`, err.message);
      return false;
    }
  }

  /**
   * Low-level method to delete objects from S3
   * @async
   * @param {import('@aws-sdk/client-s3').DeleteObjectsCommandInput} params - S3 delete objects parameters
   * @returns {Promise<boolean>} Returns true if deletion succeeded, false if failed
   * @throws {Error} May throw errors from AWS S3 SDK
   * @description This method uses the AWS SDK v3 DeleteObjectsCommand to delete multiple objects
   * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjectscommandinput.html|DeleteObjectsCommandInput}
   * @example
   * await deleteS3({
   *   Bucket: 'my-bucket',
   *   Key:  'key'
   * });
   */
  async deleteS3(params) {
    try {
      await this.s3.send(new DeleteObjectsCommand(params));
      return true;
    } catch (err) {
      console.error(`S3 Error [${err.$metadata?.httpStatusCode}]:`, err.message);
      return false;
    }

  }

  async getS3ObjectStream(cardId) {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: cardId
    };

    try {
      const command = new GetObjectCommand(params);
      const response = await this.s3.send(command);

      if (!response.Body) {
        throw new Error('No content found in S3 object');
      }

      return {
        stream: response.Body,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified
      };
    } catch (err) {
      console.error('S3 Error:', err);
      return null;
    }
  }

  async getCollectionImages(collectionId) {
    try {
      const collection = await DBCollections().findOne(
        { _id: new ObjectId(collectionId) },
        { projection: { cards: 1 } }
      );

      if (!collection) {
        return null;
      }

      const imagePromises = collection.cards.map(async (card) => {
        const imageData = await this.getS3ObjectStream(card._id);
        if (!imageData) return null;

        return {
          cardId: card._id,
          ...imageData
        };
      });

      const images = await Promise.all(imagePromises);
      return images.filter(img => img !== null);
    } catch (err) {
      console.error('Error fetching collection images:', err);
      return null;
    }
  }
}

export default S3
