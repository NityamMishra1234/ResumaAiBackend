// s3.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import AWS from "aws-sdk"; 

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: this.configService.getOrThrow<string>("AWS_REGION"),
      accessKeyId: this.configService.getOrThrow<string>("AWS_ACCESS_KEY"),
      secretAccessKey: this.configService.getOrThrow<string>("AWS_SECRET_KEY"),
    });
  }

  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string
  ): Promise<{ url: string }> {
    const bucket = this.configService.getOrThrow<string>("AWS_BUCKET");

    const result = await this.s3.upload({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }).promise();

    console.log("[S3] Uploaded:", result.Location);

    return { url: result.Location };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucket = this.configService.getOrThrow<string>("AWS_BUCKET");

      const key = this.extractKeyFromUrl(fileUrl);

      console.log("[S3] Deleting Key:", key);

      await this.s3.deleteObject({
        Bucket: bucket,
        Key: key,
      }).promise();

      console.log("[S3] Deleted successfully");
    } catch (error) {
      console.error("[S3] Delete Error:", error);
      throw error;
    }
  }

  // 🔥 THIS WAS MISSING
  private extractKeyFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const key = parsedUrl.pathname.substring(1);

      console.log("[S3] Extracted Key:", key);

      return key;
    } catch (error) {
      console.error("[S3] Failed to extract key:", url, error);
      throw new Error("Invalid S3 URL");
    }
  }
}