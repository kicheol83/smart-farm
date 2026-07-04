import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  SendEmailVerificationInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  MessageResponse,
} from '../../libs/dto/auth/auth';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { WithoutGuard } from './guards/without.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => MessageResponse, {
    description: 'Send OTP code to member email for verification',
  })
  @UseGuards(WithoutGuard)
  public async sendEmailVerificationOtp(
    @Args('input') input: SendEmailVerificationInput,
  ): Promise<MessageResponse> {
    const result = await this.authService.sendEmailVerificationOtp(
      input.memberEmail,
    );
    return result;
  }

  @Mutation(() => MessageResponse, {
    description: 'Verify member email using OTP code',
  })
  @UseGuards(WithoutGuard)
  public async verifyEmail(
    @Args('input') input: VerifyEmailInput,
  ): Promise<MessageResponse> {
    const result = await this.authService.verifyEmail(
      input.memberEmail,
      input.emailCode,
    );
    return result;
  }

  @Mutation(() => MessageResponse, {
    description: 'Send password reset OTP to member email',
  })
  @UseGuards(WithoutGuard)
  public async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<MessageResponse> {
    const result = await this.authService.forgotPassword(input.memberEmail);
    return result;
  }

  @Mutation(() => MessageResponse, {
    description: 'Reset member password using OTP code',
  })
  @UseGuards(WithoutGuard)
  public async resetPassword(
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
