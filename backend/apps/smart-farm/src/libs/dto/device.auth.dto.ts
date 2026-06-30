import { ObjectType, InputType, Field, ID } from '@nestjs/graphql';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

@ObjectType()
export class DeviceApiKey {
  @Field(() => ID)
  _id: string;

  @Field()
  apiKey: string;

  @Field(() => ID)
  deviceId: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  lastUsedAt?: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  createdAt: Date;
}

@InputType()
export class GenerateDeviceApiKeyInput {
  @Field(() => ID)
  @IsMongoId()
  deviceId: string;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

@InputType()
export class RevokeDeviceApiKeyInput {
  @Field(() => ID)
  @IsMongoId()
  deviceId: string;
}
