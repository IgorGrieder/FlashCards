import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

class S3 {

  s3 = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
  });

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
