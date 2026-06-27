import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { IsEnum, IsOptional, IsMongoId } from 'class-validator';

export enum UploadFolder {
  AVATAR = 'AVATAR',
  CAMERA_SNAPSHOT = 'CAMERA_SNAPSHOT',
  TASK_ATTACHMENT = 'TASK_ATTACHMENT',
  REPORT_EXPORT = 'REPORT_EXPORT',
}

registerEnumType(UploadFolder, {
  name: 'UploadFolder',
  valuesMap: {
    AVATAR: { description: 'Foydalanuvchi avatar — avatars/' },
    CAMERA_SNAPSHOT: { description: 'Kamera snapshot — snapshots/' },
    TASK_ATTACHMENT: { description: 'Task fayllar — tasks/' },
    REPORT_EXPORT: { description: 'Eksport hisobotlar — reports/' },
  },
});

@ObjectType()
export class UploadedFile {
  @Field({ description: 'S3 public URL' })
  url: string;

  @Field()
  key: string;

  @Field()
  originalName: string;

  @Field()
  mimeType: string;

  @Field()
  size: number;
}

@InputType()
export class FileUploadInput {
  @Field(() => UploadFolder)
  @IsEnum(UploadFolder)
  folder: UploadFolder;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsMongoId()
  resourceId?: string;
}

export { GraphQLUpload, FileUpload };
