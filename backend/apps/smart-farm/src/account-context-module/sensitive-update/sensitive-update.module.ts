import { Module } from '@nestjs/common';
import { SensitiveUpdateResolver } from './sensitive-update.resolver';
import { SensitiveUpdateService } from './sensitive-update.service';
import { AuthModule } from '../auth/auth.module';
import { MemberSchema } from '../../schemas/account/Member.model';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { EmailVerificationsModule } from '../email-verifications/email-verifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
    AuthModule,
    MailModule,
    EmailVerificationsModule
  ],
  providers: [SensitiveUpdateResolver, SensitiveUpdateService],
  exports: [SensitiveUpdateService, SensitiveUpdateResolver],
})
export class SensitiveUpdateModule {}
