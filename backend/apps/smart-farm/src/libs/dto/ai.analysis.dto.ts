import {
  ObjectType,
  InputType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

export enum IrrigationDecision {
  IRRIGATE_NOW = 'IRRIGATE_NOW',
  IRRIGATE_SOON = 'IRRIGATE_SOON',
  NO_IRRIGATION = 'NO_IRRIGATION',
  SKIP_RAIN = 'SKIP_RAIN',
  ERROR = 'ERROR',
}

export enum SoilCondition {
  DRY = 'DRY',
  OPTIMAL = 'OPTIMAL',
  WET = 'WET',
  FLOODED = 'FLOODED',
}

export enum PlantStress {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

registerEnumType(IrrigationDecision, {
  name: 'IrrigationDecision',
  valuesMap: {
    IRRIGATE_NOW: { description: "Darhol sug'orish kerak" },
    IRRIGATE_SOON: { description: "30 daqiqada sug'orish" },
    NO_IRRIGATION: { description: "Sug'orish shart emas" },
    SKIP_RAIN: { description: "Yomg'ir bo'lishi kutilmoqda" },
    ERROR: { description: 'Sensor xatoligi' },
  },
});

registerEnumType(SoilCondition, { name: 'SoilCondition' });
registerEnumType(PlantStress, { name: 'PlantStress' });

@ObjectType()
export class SensorSnapshot {
  @Field(() => Float, { nullable: true })
  temperature?: number;

  @Field(() => Float, { nullable: true })
  humidity?: number;

  @Field(() => Float, { nullable: true })
  soilMoisture?: number;

  @Field(() => Float, { nullable: true })
  light?: number;

  @Field(() => Float, { nullable: true })
  waterLevel?: number;

  @Field()
  measuredAt: Date;
}

@ObjectType()
export class SensorInsight {
  @Field()
  field: string;

  @Field(() => Float)
  value: number;

  @Field()
  status: string;

  @Field()
  message: string;
}

@ObjectType()
export class AiAnalysisResult {
  @Field(() => ID)
  greenHouseId: string;

  @Field(() => IrrigationDecision)
  irrigationDecision: IrrigationDecision;

  @Field(() => SoilCondition)
  soilCondition: SoilCondition;

  @Field(() => PlantStress)
  plantStress: PlantStress;

  @Field(() => Float)
  irrigationUrgency: number;

  @Field(() => Int, {
    nullable: true,
  })
  recommendedDurationSec?: number;

  @Field(() => Float, {
    nullable: true,
  })
  recommendedWaterLiters?: number;

  @Field(() => [SensorInsight])
  insights: SensorInsight[];

  @Field(() => String)
  summary: string;

  @Field()
  analyzedAt: Date;
}

@ObjectType()
export class IrrigationLog {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  greenHouseId: string;

  @Field(() => IrrigationDecision)
  decision: IrrigationDecision;

  @Field(() => Float)
  durationSec: number;

  @Field(() => Float, { nullable: true })
  waterUsedLiters?: number;

  @Field()
  isAutomatic: boolean;

  @Field(() => Float, {})
  soilMoistureBefore: number;

  @Field(() => Float, { nullable: true })
  soilMoistureAfter?: number;

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;
}

@InputType()
export class AnalyzeGreenhouseInput {
  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;
}

@InputType()
export class ManualIrrigationInput {
  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field(() => Int)
  durationSec: number;
}
