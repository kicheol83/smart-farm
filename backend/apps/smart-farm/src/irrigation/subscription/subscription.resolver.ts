import {
  Resolver,
  Subscription,
  Query,
  Args,
  ID,
  ObjectType,
  Field,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = 'PUB_SUB';

export const EVENTS = {
  SENSOR_ALERT: 'SENSOR_ALERT',
  IRRIGATION_STARTED: 'IRRIGATION_STARTED',
  IRRIGATION_STOPPED: 'IRRIGATION_STOPPED',
  DEVICE_OFFLINE: 'DEVICE_OFFLINE',
  AI_ANALYSIS_DONE: 'AI_ANALYSIS_DONE',
} as const;

export enum AlertSeverityLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

registerEnumType(AlertSeverityLevel, { name: 'AlertSeverityLevel' });

@ObjectType()
export class SensorAlertEvent {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  greenHouseName: string;

  @Field()
  sensorType: string;

  @Field(() => Float)
  currentValue: number;

  @Field(() => Float)
  threshold: number;

  @Field(() => AlertSeverityLevel)
  severity: AlertSeverityLevel;

  @Field()
  message: string;

  @Field()
  triggeredAt: Date;
}

@ObjectType()
export class IrrigationEvent {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  greenHouseName: string;

  @Field(() => Float)
  soilMoistureBefore: number;

  @Field(() => Float, {
    nullable: true,
  })
  durationSec?: number;

  @Field()
  isAutomatic: boolean;

  @Field()
  timestamp: Date;
}

@ObjectType()
export class DeviceOfflineEvent {
  @Field(() => ID)
  deviceId: string;

  @Field()
  deviceName: string;

  @Field(() => ID)
  greenHouseId: string;

  @Field()
  detectedAt: Date;
}

@ObjectType()
export class AiAnalysisDoneEvent {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  decision: string;

  @Field(() => Float)
  irrigationUrgency: number;

  @Field()
  summary: string;

  @Field()
  analyzedAt: Date;
}

@Resolver()
export class SubscriptionResolver {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  @Subscription(() => SensorAlertEvent, {
    description: 'Sensor threshold buzilganda real-time alert',
    filter: (payload, variables) =>
      payload.sensorAlert.greenHouseId === variables.greenHouseId,
  })
  sensorAlert(@Args('greenHouseId', { type: () => ID }) _greenHouseId: string) {
    return this.pubSub.asyncIterator(EVENTS.SENSOR_ALERT);
  }

  @Subscription(() => IrrigationEvent, {
    description: "Sug'orish boshlanganda",
    filter: (payload, variables) =>
      payload.irrigationStarted.greenHouseId === variables.greenHouseId,
  })
  irrigationStarted(
    @Args('greenHouseId', { type: () => ID }) _greenHouseId: string,
  ) {
    return this.pubSub.asyncIterator(EVENTS.IRRIGATION_STARTED);
  }

  @Subscription(() => IrrigationEvent, {
    description: "Sug'orish tugaganda",
    filter: (payload, variables) =>
      payload.irrigationStopped.greenHouseId === variables.greenHouseId,
  })
  irrigationStopped(
    @Args('greenHouseId', { type: () => ID }) _greenHouseId: string,
  ) {
    return this.pubSub.asyncIterator(EVENTS.IRRIGATION_STOPPED);
  }

  @Subscription(() => DeviceOfflineEvent, {
    description: "Qurilma offline bo'lganda real-time xabar",
    filter: (payload, variables) =>
      payload.deviceWentOffline.greenHouseId === variables.greenHouseId,
  })
  deviceWentOffline(
    @Args('greenHouseId', { type: () => ID }) _greenHouseId: string,
  ) {
    return this.pubSub.asyncIterator(EVENTS.DEVICE_OFFLINE);
  }

  @Subscription(() => AiAnalysisDoneEvent, {
    description: 'AI tahlil tugaganda natija',
    filter: (payload, variables) =>
      payload.aiAnalysisDone.greenHouseId === variables.greenHouseId,
  })
  aiAnalysisDone(
    @Args('greenHouseId', { type: () => ID }) _greenHouseId: string,
  ) {
    return this.pubSub.asyncIterator(EVENTS.AI_ANALYSIS_DONE);
  }
}
