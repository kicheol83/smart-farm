import { ObjectType, InputType, Field, ID, Float } from '@nestjs/graphql';
import {
  IsMongoId,
  IsNumber,
  IsPositive,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

@ObjectType()
export class PlantHealth {
  @Field(() => ID)
  _id: string;

  @Field(() => Float)
  plantHealthIndex: number;

  @Field(() => Float)
  plantValue: number;

  @Field()
  recordeAt: Date;

  @Field(() => ID)
  fieldsId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreatePlantHealthInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  plantHealthIndex: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  plantValue: number;

  @Field()
  @IsDateString()
  recordeAt: string;

  @Field(() => ID)
  @IsMongoId()
  fieldsId: string;
}
