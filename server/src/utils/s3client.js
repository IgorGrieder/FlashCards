import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetBucketLocationCommand } from "@aws-sdk/client-s3"


class S3 {
  s3 = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
    signatureVersion: 'v4'
  });

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
      console.log(err);
      return false;
    }
  }
}

export default S3
