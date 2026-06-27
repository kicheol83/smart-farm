import { Module } from '@nestjs/common';
import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';

@Module({
  providers: [UploadResolver, UploadService],
  exports: [UploadService],
})
export class UploadModule {}
