import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { EmailVerificationsModule } from './email-verifications/email-verifications.module';
import { MemberSettingsModule } from './member-settings/member-settings.module';
import { NotifiactionSettingsModule } from './notifiaction-settings/notifiaction-settings.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MemberModule, PasswordResetModule, EmailVerificationsModule, MemberSettingsModule, NotifiactionSettingsModule, AuthModule]
})
export class AccountContextModuleModule {}
