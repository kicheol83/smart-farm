import { ObjectType, InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  IsMongoId,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
} from 'class-validator';

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

  @Field(() => ID, {
    nullable: true,
  })
  sectionId?: string;

  @Field(() => Int, {
    nullable: true,
  })
  durationMinutes?: number;

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

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  sectionId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;
}

@ObjectType()
export class WaterEfficiencyReport {
  @Field(() => Float)
  efficiencyScore: number;

  @Field(() => Float, {})
  averageWaterPerPlant: number;

  @Field(() => Float)
  irrigationDurationMinutes: number;

  @Field(() => Float)
  totalUsage: number;
}

@ObjectType()
export class WaterAnomalyItem {
  @Field()
  date: Date;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  deviationPercent: number;
}

@ObjectType()
export class WaterAnomalyReport {
  @Field(() => Int)
  anomalyCount: number;

  @Field(() => Float)
  alertThresholdPercent: number;

  @Field()
  lastScan: Date;

  @Field(() => [WaterAnomalyItem])
  anomalies: WaterAnomalyItem[];
}

@ObjectType()
export class WaterCostEstimation {
  @Field(() => Float)
  costPerDay: number;

  @Field(() => Float)
  trendPercent: number;

  @Field()
  status: string;

  @Field(() => Float, {})
  costPerLiter: number;
}

@ObjectType()
export class ZoneUsageItem {
  @Field(() => ID)
  sectionId: string;

  @Field()
  sectionName: string;

  @Field(() => Float)
  totalUsage: number;

  @Field()
  note: string;
}

@ObjectType()
export class ZoneUsageReport {
  @Field(() => [ZoneUsageItem])
  zones: ZoneUsageItem[];
}

@InputType()
export class GetWaterAnalyticsInput {
  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  to?: string;
}
