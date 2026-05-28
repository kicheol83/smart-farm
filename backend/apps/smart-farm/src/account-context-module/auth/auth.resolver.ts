import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  SendEmailVerificationInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  MessageResponse,
} from '../../libs/dto/auth/auth';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Email tasdiqlash uchun OTP yuborish
   */
  @Mutation(() => MessageResponse, {
    description: 'Send OTP code to member email for verification',
  })
  async sendEmailVerificationOtp(
    @Args('input') input: SendEmailVerificationInput,
  ): Promise<MessageResponse> {
    const result = await this.authService.sendEmailVerificationOtp(
      input.memberEmail,
    );
    return result;
  }

  /**
   * Email OTP ni tekshirish
   */
  @Mutation(() => MessageResponse, {
    description: 'Verify member email using OTP code',
  })
  async verifyEmail(
    @Args('input') input: VerifyEmailInput,
  ): Promise<MessageResponse> {
    const result = await this.authService.verifyEmail(
      input.memberEmail,
      input.emailCode,
    );
    return result;
  }

  /**
   * Parol tiklash uchun OTP yuborish
   */
  @Mutation(() => MessageResponse, {
    description: 'Send password reset OTP to member email',
  })
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<MessageResponse> {
    const result = await this.authService.forgotPassword(input.memberEmail);
    return result;
  }

  /**
   * OTP bilan yangi parol o'rnatish
   */
  @Mutation(() => MessageResponse, {
    description: 'Reset member password using OTP code',
  })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<MessageResponse> {
    const result = await this.authService.resetPassword(
      input.memberEmail,
      input.passwordToken,
      input.newPassword,
    );
    return result;
  }
}
