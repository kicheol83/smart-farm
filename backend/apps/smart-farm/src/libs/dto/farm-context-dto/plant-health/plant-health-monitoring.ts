import { ObjectType, InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  IsMongoId,
  IsNumber,
  IsPositive,
  IsDateString,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

@ObjectType()
export class SectionPlantHealth {
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
}

@ObjectType()
export class SectionHealthTrendPoint {
  @Field()
  date: Date;

  @Field(() => Float)
  healthIndex: number;

  @Field(() => Float)
  plantValue: number;
}

@ObjectType()
export class SectionHealthTrend {
  @Field(() => ID)
  sectionId: string;

  @Field()
  sectionName: string;

  @Field(() => Float)
  currentIndex: number;

  @Field(() => Float)
  changePercent: number;

  @Field(() => String)
  status: string;

  @Field(() => [SectionHealthTrendPoint])
  trend: SectionHealthTrendPoint[];
}

@ObjectType()
export class GreenhousePlantHealthOverview {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  greenHouseName: string;

  @Field(() => Float)
  overallHealthIndex: number;

  @Field(() => Int)
  totalPlants: number;

  @Field(() => Int)
  healthyPlants: number;

  @Field(() => Int)
  warningPlants: number;

  @Field(() => Int)
  criticalPlants: number;

  @Field(() => [SectionHealthTrend])
  sectionTrends: SectionHealthTrend[];
}

@InputType()
export class RecordSectionHealthInput {
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

@InputType()
export class GetSectionHealthTrendInput {
  @Field(() => ID)
  @IsMongoId()
  sectionId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  to?: string;
}
