import { Module } from '@nestjs/common';
import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/account/Member.model';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { EmailVerificationsModule } from '../email-verifications/email-verifications.module';
import { SensitiveUpdateService } from '../sensitive-update/sensitive-update.service';
import { SensitiveUpdateResolver } from '../sensitive-update/sensitive-update.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
    EmailVerificationsModule,
    MailModule,
    AuthModule,
  ],
  providers: [
    AccountService,
    AccountResolver,
    SensitiveUpdateService,
    SensitiveUpdateResolver,
  ],
  exports: [AccountService],
})
export class AccountModule {}
