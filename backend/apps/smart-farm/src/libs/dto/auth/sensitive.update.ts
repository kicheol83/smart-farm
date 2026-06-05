import { InputType, ObjectType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
  Matches,
} from 'class-validator';

@InputType()
export class RequestSensitiveUpdateInput {
  @Field({
    nullable: true,
    description: 'New email address (if changing email)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  newEmail?: string;

  @Field({ nullable: true, description: 'New password (if changing password)' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain uppercase, lowercase and a number',
  })
  newPassword?: string;
}

@InputType()
export class ConfirmSensitiveUpdateInput {
  @Field({ description: '6-digit OTP code sent to your current email' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  emailCode: string;
}

@ObjectType()
export class SensitiveUpdateResponse {
  @Field()
  message: string;

  @Field({ nullable: true, description: 'New JWT token after update' })
  accessToken?: string;
}
