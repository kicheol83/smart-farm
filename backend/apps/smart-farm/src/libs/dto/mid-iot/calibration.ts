import { ObjectType, InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class SensorCalibration {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  sensorId: string;

  @Field(() => Float)
  offset: number;

  @Field(() => Float)
  scaleFactor: number;

  @Field({ nullable: true })
  description?: string;

  @Field()
  calibratedAt: Date;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class CalibrationResult {
  @Field(() => Float)
  rawValue: number;

  @Field(() => Float)
  calibratedValue: number;

  @Field(() => Float)
  delta: number;
}

@InputType()
export class SetCalibrationInput {
  @Field(() => ID)
  @IsMongoId()
  sensorId: string;

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  offset: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsNumber()
  scaleFactor: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
