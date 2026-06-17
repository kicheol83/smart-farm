import { ObjectType, InputType, Field, ID, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsMongoId,
} from 'class-validator';

@ObjectType()
export class Greenhouse {
  @Field(() => ID)
  _id: string;

  @Field()
  greenHouseName: string;

  @Field()
  greenHouseType: string;

  @Field(() => Float)
  greenHouseSize: number;

  @Field(() => ID)
  farmsId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateGreenhouseInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  greenHouseName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  greenHouseType: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  greenHouseSize: number;

  @Field(() => ID)
  @IsMongoId()
  farmsId: string;
}

@InputType()
export class UpdateGreenhouseInput {
  @Field({ nullable: true })
  @IsString()
  greenHouseName?: string;

  @Field({ nullable: true })
  @IsString()
  greenHouseType?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsPositive()
  greenHouseSize?: number;
}
