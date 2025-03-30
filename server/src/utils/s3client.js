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
  async verifyBucket() {
    const location = await this.s3.send(
      new GetBucketLocationCommand({ Bucket: process.env.BUCKET_NAME })
    )
    console.log('Actual bucket region:', location.LocationConstraint)
  }
  async insertS3(params) {
    console.log('Bucket Region:', process.env.BUCKET_REGION)
    console.log('Bucket Name:', process.env.BUCKET_NAME)
    console.log('Access Key:', process.env.ACCESS_KEY ? '***' : 'MISSING')
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
