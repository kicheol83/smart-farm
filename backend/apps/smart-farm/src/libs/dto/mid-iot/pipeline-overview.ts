import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { AnomalyLog } from './anomaly-detection';

@ObjectType()
export class PipelineThroughputPoint {
  @Field()
  hour: Date;

  @Field(() => Int)
  readings: number;

  @Field(() => Int)
  anomalies: number;
}

@ObjectType()
export class PipelineSensor {
  @Field(() => ID)
  sensorId: string;

  @Field()
  sensorType: string;

  @Field({ nullable: true })
  unit?: string;

  @Field()
  deviceName: string;

  @Field(() => Float, { nullable: true })
  mean?: number;

  @Field(() => Float, { nullable: true })
  std?: number;

  @Field(() => Int)
  sampleSize: number;

  @Field(() => Float, { nullable: true })
  lastValue?: number;

  @Field({ nullable: true })
  lastReadingAt?: Date;

  @Field(() => Int)
  anomaliesLast24h: number;
}

@ObjectType()
export class PipelineDevice {
  @Field(() => ID)
  deviceId: string;

  @Field()
  deviceName: string;

  @Field()
  deviceStatus: string;

  @Field({ nullable: true })
  lastSeenAt?: Date;

  @Field(() => Int)
  sensorCount: number;
}

@ObjectType()
export class PipelineOverview {
  @Field(() => ID)
  greenHouseId: string;

  @Field(() => Int)
  readingsLast24h: number;

  @Field(() => Int)
  readingsLastHour: number;

  @Field(() => Int)
  anomaliesLast24h: number;

  @Field(() => Int)
  errorsLast24h: number;

  @Field(() => [PipelineThroughputPoint])
  throughput: PipelineThroughputPoint[];

  @Field(() => [PipelineSensor])
  sensors: PipelineSensor[];

  @Field(() => [PipelineDevice])
  devices: PipelineDevice[];

  @Field(() => [AnomalyLog])
  recentAnomalies: AnomalyLog[];
}
