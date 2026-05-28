import { Module } from '@nestjs/common';
import { PasswordResetResolver } from './password-reset.resolver';
import { PasswordResetService } from './password-reset.service';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import PasswordResetSchema from '../../schemas/account/PasswordReset.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'passwordReset', schema: PasswordResetSchema },
    ]),
  ],
  providers: [PasswordResetResolver, PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
