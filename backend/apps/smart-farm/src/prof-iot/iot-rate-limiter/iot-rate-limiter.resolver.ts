import {
  Resolver,
  Query,
  Args,
  ID,
  Int,
  ObjectType,
  Field,
  Float,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

@ObjectType()
export class RateLimitStatus {
  @Field(() => ID)
  deviceId: string;

  @Field(() => RateLimitTypeEnum)
  type: string;

  @Field(() => Int, { description: 'Hozirgi request soni' })
  currentCount: number;

  @Field(() => Int, { description: 'Maksimal ruxsat etilgan' })
  maxAllowed: number;

  @Field(() => Float, { description: 'Foydalanish foizi 0-100' })
  usagePercent: number;

  @Field({ description: 'Limit oshganmi' })
  isLimited: boolean;
}

import { registerEnumType } from '@nestjs/graphql';
import {
  IotRateLimiterService,
  RateLimitType,
} from './iot-rate-limiter.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

export enum RateLimitTypeEnum {
  SENSOR_DATA = 'sensor',
  HEARTBEAT = 'heartbeat',
  COMMAND_ACK = 'cmd',
}

registerEnumType(RateLimitTypeEnum, {
  name: 'RateLimitTypeEnum',
  valuesMap: {
    SENSOR_DATA: { description: '60s da max 120 request' },
    HEARTBEAT: { description: '60s da max 5 request' },
    COMMAND_ACK: { description: '60s da max 60 request' },
  },
});

const LIMITS: Record<RateLimitType, number> = {
  [RateLimitType.SENSOR_DATA]: 120,
  [RateLimitType.HEARTBEAT]: 5,
  [RateLimitType.COMMAND_ACK]: 60,
};

@Resolver()
export class IotRateLimiterResolver {
  constructor(private readonly rateLimiter: IotRateLimiterService) {}

  @Query(() => RateLimitStatus)
  @UseGuards(AuthGuard)
  async deviceRateLimitStatus(
    @Args('deviceId', { type: () => ID }) deviceId: string,
    @Args('type', { type: () => RateLimitTypeEnum }) type: RateLimitType,
  ): Promise<RateLimitStatus> {
    const currentCount = await this.rateLimiter.getCount(deviceId, type);
    const maxAllowed = LIMITS[type];
    const usagePercent =
      Math.round((currentCount / maxAllowed) * 100 * 10) / 10;

    const result = {
      deviceId,
      type,
      currentCount,
      maxAllowed,
      usagePercent,
      isLimited: currentCount >= maxAllowed,
    };
    return result;
  }
}
