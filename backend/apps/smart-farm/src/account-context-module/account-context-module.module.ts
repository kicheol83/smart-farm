import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { EmailVerificationsModule } from './email-verifications/email-verifications.module';
import { MemberSettingsModule } from './member-settings/member-settings.module';
import { NotifiactionSettingsModule } from './notification-settings/notifiaction-settings.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AppleModule } from './apple/apple.module';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    MemberModule,
    PasswordResetModule,
    EmailVerificationsModule,
    MemberSettingsModule,
    NotifiactionSettingsModule,
    AuthModule,
    MailModule,
    AppleModule,
    GoogleAuthModule,
    SocialModule,
  ],
})
export class AccountContextModuleModule {}
