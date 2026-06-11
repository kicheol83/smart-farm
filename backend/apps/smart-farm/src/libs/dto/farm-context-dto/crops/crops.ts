import { ObjectType, InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

@ObjectType()
export class Crops {
  @Field(() => ID)
  _id: string;

  @Field()
  cropsName: string;

  @Field(() => Float, { description: '°C' })
  cropsOptionalTemps: number;

  @Field(() => Float, { description: '%' })
  cropsOptionalMoistures: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateCropsInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'cropsName is required' })
  cropsName: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  cropsOptionalTemps: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  cropsOptionalMoistures: number;
}

@InputType()
export class UpdateCropsInput {
  @Field({ nullable: true })
  @IsString()
  cropsName?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsPositive()
  cropsOptionalTemps?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsPositive()
  cropsOptionalMoistures?: number;
}
