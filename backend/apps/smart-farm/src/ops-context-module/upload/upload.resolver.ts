import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  FileUpload,
  FileUploadInput,
  GraphQLUpload,
  UploadedFile,
  UploadFolder,
} from '../../libs/dto/upload/upload';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => UploadedFile, {
    description: 'Faylni S3 ga yuklash (avatar, snapshot, attachment...)',
  })
  @UseGuards(AuthGuard)
  public async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('input') input: FileUploadInput,
    @AuthMember() _user: Member,
  ): Promise<UploadedFile> {
    return this.uploadService.uploadFile(file, input.folder, input.resourceId);
  }

  @Mutation(() => UploadedFile, {
    description: 'Profil avatarini yuklash',
  })
  @UseGuards(AuthGuard)
  public async uploadAvatar(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @AuthMember() user: Member,
  ): Promise<UploadedFile> {
    return this.uploadService.uploadFile(
      file,
      UploadFolder.AVATAR,
      user._id.toString(),
    );
  }

  @Mutation(() => UploadedFile, {
    description: 'Kamera snapshotini S3 ga yuklash',
  })
  @UseGuards(AuthGuard)
  public async uploadCameraSnapshot(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('cameraId') cameraId: string,
  ): Promise<UploadedFile> {
    return this.uploadService.uploadFile(
      file,
      UploadFolder.CAMERA_SNAPSHOT,
      cameraId,
    );
  }

  @Mutation(() => Boolean, { description: "S3 dan faylni o'chirish" })
  @UseGuards(AuthGuard)
  public async deleteFile(@Args('key') key: string): Promise<boolean> {
    return this.uploadService.deleteFile(key);
  }
}
