import { Module } from '@nestjs/common';
import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [UploadResolver, UploadService],
  exports: [UploadService],
})
export class UploadModule {}
