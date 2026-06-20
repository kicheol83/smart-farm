import {
  ObjectType,
  InputType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsMongoId, IsOptional, IsDateString } from 'class-validator';

export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ReportPeriod {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  CUSTOM = 'CUSTOM',
}

registerEnumType(ReportType, {
  name: 'ReportType',
  valuesMap: {
    DAILY: { description: 'Kunlik hisobot' },
    WEEKLY: { description: 'Haftalik hisobot' },
    MONTHLY: { description: 'Oylik hisobot' },
  },
});

registerEnumType(ReportPeriod, {
  name: 'ReportPeriod',
  valuesMap: {
    LAST_7_DAYS: { description: 'Oxirgi 7 kun' },
    LAST_30_DAYS: { description: 'Oxirgi 30 kun' },
    LAST_90_DAYS: { description: 'Oxirgi 90 kun' },
    CUSTOM: { description: "Maxsus sana oralig'i" },
  },
});

@ObjectType()
export class ReportSensorAvg {
  @Field(() => Float)
  avgTemperature?: number;

  @Field(() => Float)
  avgHumidity?: number;

  @Field(() => Float)
  avgPh?: number;

  @Field(() => Float)
  avgCo2?: number;

  @Field(() => Float, {
    nullable: true,
  })
  avgSoilMoisture?: number;

  @Field(() => Float)
  avgLight?: number;
}

@ObjectType()
export class GreenhouseReportSummary {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  greenHouseName: string;

  @Field(() => ReportSensorAvg)
  sensorAverages: ReportSensorAvg;

  @Field(() => Int)
  totalAlerts: number;

  @Field(() => Int)
  unresolvedAlerts: number;

  @Field(() => Float)
  totalWaterUsage: number;

  @Field(() => Float)
  plantHealthScore: number;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;
}

@ObjectType()
export class PlantHealthTrendPoint {
  @Field()
  date: Date;

  @Field(() => Float)
  healthIndex: number;

  @Field(() => Float)
  plantValue: number;
}

@ObjectType()
export class OverallPlantHealthReport {
  @Field(() => Float)
  currentHealthIndex: number;

  @Field(() => Float)
  changePercent: number;

  @Field(() => String)
  status: string;

  @Field(() => [PlantHealthTrendPoint], {})
  trend: PlantHealthTrendPoint[];
}

@ObjectType()
export class SoilMoistureTrendPoint {
  @Field()
  recordedAt: Date;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class SoilMoistureTrendReport {
  @Field(() => Float)
  average: number;

  @Field(() => Float)
  min: number;

  @Field(() => Float)
  max: number;

  @Field(() => Float)
  changePercent: number;

  @Field(() => [SoilMoistureTrendPoint])
  dataPoints: SoilMoistureTrendPoint[];
}

@ObjectType()
export class WaterUsagePoint {
  @Field()
  date: Date;

  @Field(() => Float)
  amount: number;
}

@ObjectType()
export class WaterUsageReport {
  @Field(() => Float)
  totalUsage: number;

  @Field(() => Float)
  dailyAverage: number;

  @Field(() => Float)
  changePercent: number;

  @Field(() => [WaterUsagePoint])
  dataPoints: WaterUsagePoint[];
}

@ObjectType()
export class AlertSummaryItem {
  @Field()
  alertsType: string;

  @Field()
  alertsSeverity: string;

  @Field(() => Int)
  count: number;

  @Field()
  lastOccurred: Date;
}

@ObjectType()
export class AlertsSummaryReport {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  critical: number;

  @Field(() => Int)
  warning: number;

  @Field(() => Int)
  info: number;

  @Field(() => [AlertSummaryItem])
  items: AlertSummaryItem[];
}

@ObjectType()
export class TrendChartPoint {
  @Field()
  timestamp: Date;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class SensorTrendChart {
  @Field({})
  sensorType: string;

  @Field()
  unit: string;

  @Field(() => Float)
  current: number;

  @Field(() => Float)
  average: number;

  @Field(() => Float)
  min: number;

  @Field(() => Float)
  max: number;

  @Field(() => [TrendChartPoint])
  dataPoints: TrendChartPoint[];
}

@ObjectType()
export class FullGreenhouseReport {
  @Field(() => GreenhouseReportSummary, {})
  summary: GreenhouseReportSummary;

  @Field(() => OverallPlantHealthReport, {})
  plantHealth: OverallPlantHealthReport;

  @Field(() => SoilMoistureTrendReport, {})
  soilMoisture: SoilMoistureTrendReport;

  @Field(() => WaterUsageReport, {})
  waterUsage: WaterUsageReport;

  @Field(() => AlertsSummaryReport)
  alertsSummary: AlertsSummaryReport;

  @Field(() => [SensorTrendChart])
  trendCharts: SensorTrendChart[];
}

@ObjectType()
export class Report {
  @Field(() => ID)
  _id: string;

  @Field()
  reportsType: string;

  @Field()
  generatedAt: Date;

  @Field(() => ID)
  greenHousesId: string;
}

@InputType()
export class GetReportInput {
  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field(() => ReportPeriod)
  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  customFrom?: string;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  customTo?: string;
}

@InputType()
export class SaveReportInput {
  @Field(() => ID)
  @IsMongoId()
  greenHousesId: string;

  @Field(() => ReportType)
  @IsEnum(ReportType)
  reportsType: ReportType;
}
