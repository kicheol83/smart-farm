import { InputType, ObjectType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  Matches,
} from 'class-validator';

@InputType()
export class SendEmailVerificationInput {
  @Field({ description: "Member's email address" })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'memberEmail is required' })
  memberEmail: string;
}

@InputType()
export class VerifyEmailInput {
  @Field({ description: "Member's email address" })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'memberEmail is required' })
  memberEmail: string;

  @Field({ description: '6-digit OTP code sent to email' })
  @IsString()
  @IsNotEmpty({ message: 'emailCode is required' })
  @Length(6, 6, { message: 'emailCode must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'emailCode must contain only digits' })
  emailCode: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field({ description: "Member's email address to send reset code" })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'memberEmail is required' })
  memberEmail: string;
}

@InputType()
export class ResetPasswordInput {
  @Field({ description: "Member's email address" })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'memberEmail is required' })
  memberEmail: string;

  @Field({ description: '6-digit OTP code sent to email for password reset' })
  @IsString()
  @IsNotEmpty({ message: 'passwordToken is required' })
  @Length(6, 6, { message: 'passwordToken must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'passwordToken must contain only digits' })
  passwordToken: string;

  @Field({ description: 'New password (min 8 characters)' })
  @IsString()
  @IsNotEmpty({ message: 'newPassword is required' })
  @MinLength(8, { message: 'newPassword must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'newPassword must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

@ObjectType()
export class MessageResponse {
  @Field({ description: 'Result message' })
  message: string;
}
