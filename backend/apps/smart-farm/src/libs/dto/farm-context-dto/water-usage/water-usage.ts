import { ObjectType, InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsMongoId, IsNumber, IsPositive, IsDateString } from 'class-validator';

@ObjectType()
export class WaterUsage {
  @Field(() => ID)
  _id: string;

  @Field(() => Float)
  waterAmount: number;

  @Field()
  recordedAt: Date;

  @Field(() => ID)
  greenHouseId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateWaterUsageInput {
  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  waterAmount: number;

  @Field()
  @IsDateString()
  recordedAt: string;

  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;
}
