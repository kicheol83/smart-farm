import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

// ─── Inputs ───────────────────────────────────────────────────────────────────

@InputType()
export class GoogleAuthInput {
  @Field({ description: 'Google ID token from frontend (Google Sign-In)' })
  @IsString()
  @IsNotEmpty({ message: 'idToken is required' })
  idToken: string;
}

@InputType()
export class AppleAuthInput {
  @Field({
    description: 'Apple identity token from frontend (Sign in with Apple)',
  })
  @IsString()
  @IsNotEmpty({ message: 'identityToken is required' })
  identityToken: string;

  @Field({ description: 'Apple authorization code', nullable: true })
  @IsString()
  authorizationCode?: string;

  @Field({
    description: 'User full name (faqat birinchi loginda Apple beradi)',
    nullable: true,
  })
  fullName?: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

@ObjectType()
export class SocialAuthResponse {
  @Field({ description: 'JWT access token' })
  accessToken: string;

  @Field({ description: 'Yangi yaratilgan member yoki mavjud member' })
  isNewMember: boolean;
}
