import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import {
  FileUpload,
  UploadFolder,
  UploadedFile,
} from '../../libs/dto/upload/upload';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_MB = 10;

const FOLDER_PATHS: Record<UploadFolder, string> = {
  [UploadFolder.AVATAR]: 'avatars',
  [UploadFolder.CAMERA_SNAPSHOT]: 'snapshots',
  [UploadFolder.TASK_ATTACHMENT]: 'tasks',
  [UploadFolder.REPORT_EXPORT]: 'reports',
};

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnBaseUrl?: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
    this.cdnBaseUrl = this.config.get<string>('AWS_CLOUDFRONT_URL');

    this.s3 = new S3Client({
      region: this.config.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadFile(
    file: FileUpload,
    folder: UploadFolder,
    resourceId?: string,
  ): Promise<UploadedFile> {
    const { createReadStream, filename, mimetype } = file;

    this.validateMimeType(mimetype, folder);

    const buffer = await this.streamToBuffer(createReadStream());
    this.validateFileSize(buffer.length);

    const ext = path.extname(filename) || this.guessExtension(mimetype);
    const folderPath = FOLDER_PATHS[folder];
    const key = resourceId
      ? `${folderPath}/${resourceId}/${randomUUID()}${ext}`
      : `${folderPath}/${randomUUID()}${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }),
      );
    } catch (err) {
      this.logger.error(`S3 upload failed: ${err}`);
      throw new InternalServerErrorException('File upload failed.');
    }

    const url = this.buildUrl(key);

    this.logger.log(`File uploaded | key=${key} | size=${buffer.length}b`);

    return {
      url,
      key,
      originalName: filename,
      mimeType: mimetype,
      size: buffer.length,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`File deleted | key=${key}`);
      return true;
    } catch (err) {
      this.logger.error(`S3 delete failed: ${err}`);
      return false;
    }
  }

  buildUrl(key: string): string {
    if (this.cdnBaseUrl) {
      return `${this.cdnBaseUrl}/${key}`;
    }
    const region = this.config.getOrThrow<string>('AWS_REGION');
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  extractKeyFromUrl(url: string): string {
    const base = this.cdnBaseUrl ?? `https://${this.bucket}.s3.amazonaws.com`;
    return url.replace(`${base}/`, '');
  }

  private validateMimeType(mimetype: string, folder: UploadFolder): void {
    const allowed =
      folder === UploadFolder.TASK_ATTACHMENT ||
      folder === UploadFolder.REPORT_EXPORT
        ? ALLOWED_DOC_TYPES
        : ALLOWED_IMAGE_TYPES;

    if (!allowed.includes(mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${mimetype}. Allowed: ${allowed.join(', ')}`,
      );
    }
  }

  private validateFileSize(sizeBytes: number): void {
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (sizeBytes > maxBytes) {
      throw new BadRequestException(
        `File too large. Max size: ${MAX_FILE_SIZE_MB}MB`,
      );
    }
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private guessExtension(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };
    return map[mimetype] ?? '';
  }
}
