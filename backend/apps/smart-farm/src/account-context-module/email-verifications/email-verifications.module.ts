import { Module } from '@nestjs/common';
import { EmailVerificationsService } from './email-verifications.service';
import { EmailVerificationsResolver } from './email-verifications.resolver';

@Module({
  providers: [EmailVerificationsService, EmailVerificationsResolver],
})
export class EmailVerificationsModule {}
