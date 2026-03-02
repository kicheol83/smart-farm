import { Module } from '@nestjs/common';
import { PasswordResetResolver } from './password-reset.resolver';
import { PasswordResetService } from './password-reset.service';

@Module({
  providers: [PasswordResetResolver, PasswordResetService]
})
export class PasswordResetModule {}
