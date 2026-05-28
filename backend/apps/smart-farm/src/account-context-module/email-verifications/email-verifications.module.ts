import { Module } from '@nestjs/common';
import { EmailVerificationsResolver } from './email-verifications.resolver';
import { EmailVerificationService } from './email-verifications.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailVerificationSchema } from '../../schemas/account/EmailVerifications.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'emailVerifications', schema: EmailVerificationSchema },
    ]),
  ],
  providers: [EmailVerificationService, EmailVerificationsResolver],
  exports: [EmailVerificationService],
})
export class EmailVerificationsModule {}
