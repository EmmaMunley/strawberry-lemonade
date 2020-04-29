import { S3 } from "aws-sdk";
import { getFileType } from "../utils/files";
import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";
import { v4 } from "uuid";
import { LoggerFactory } from "../logger/LoggerFactory";
import { Response } from "express";
import { Logger } from "winston";

const uuid = v4;

export type ImageDownload = { data: Buffer; fileType: string };

@injectable()
export class ImageManager {
    private s3Client: S3;
    private bucket: string;
    private logger: Logger;

    constructor(config: AppConfiguration, loggerFactory: LoggerFactory) {
        const configData = config.get();
        this.bucket = configData.aws.s3.bucket;
        this.s3Client = new S3({
            endpoint: configData.aws.s3.url,
            s3ForcePathStyle: true,
        });
        this.logger = loggerFactory.getLogger(module);
    }

    // todo: This class probably shouldn't handle http-level concerns
    private writeResponse(data: Buffer, fileType: string, response: Response): void {
        response.writeHead(200, {
            "Content-Type": `image/${fileType}`,
            "Content-Length": data.length,
        });
        response.end(data);
    }

    public async download(userId: string, imageFile: string, response: Response): Promise<void> {
        try {
            const fileType = getFileType(imageFile);
            const imagePath = this.formatKey(userId, imageFile);
            const result = await this.s3Client.getObject({ Bucket: this.bucket, Key: imagePath }).promise();
            if (!Buffer.isBuffer(result.Body) || !result.ContentLength) {
                throw new Error(`Error downloading imagePath ${imagePath}`);
            }
            const data = result.Body;
            this.writeResponse(data, fileType, response);
        } catch (error) {
            this.logger.debug(`Error downloading image ${imageFile} with userId ${userId} from S3. Is the S3 Docker container running?`);
            throw error;
        }
    }

    // Returns true if the upload was successful
    public async upload(data: Buffer, userId: string, fileName: string): Promise<string> {
        try {
            const fileType = getFileType(fileName);
            const imageFile = this.getImageFile(fileType);
            const key = this.formatKey(userId, imageFile);
            await this.s3Client
                .upload({
                    Bucket: this.bucket,
                    Key: key,
                    Body: data,
                })
                .promise();
            return imageFile;
        } catch (error) {
            this.logger.debug(`Error uploading image for userId ${userId} to S3. Is the S3 Docker container running?`);
            throw error;
        }
    }

    private formatKey(userId: string, imageFile: string): string {
        return `user/${userId}/image/${imageFile}`;
    }

    private getImageFile(fileType: string): string {
        return `${uuid()}.${fileType}`;
    }
}
