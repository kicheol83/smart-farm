import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export enum RateLimitType {
  SENSOR_DATA = 'sensor',
  HEARTBEAT = 'heartbeat',
  COMMAND_ACK = 'cmd',
}

const LIMITS: Record<RateLimitType, { max: number; windowSec: number }> = {
  [RateLimitType.SENSOR_DATA]: { max: 120, windowSec: 60 },
  [RateLimitType.HEARTBEAT]: { max: 5, windowSec: 60 },
  [RateLimitType.COMMAND_ACK]: { max: 60, windowSec: 60 },
};

@Injectable()
export class IotRateLimiterService {
  private readonly logger = new Logger(IotRateLimiterService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  public async isAllowed(
    deviceId: string,
    type: RateLimitType,
  ): Promise<boolean> {
    const { max, windowSec } = LIMITS[type];
    const key = `rl:${type}:${deviceId}`;
    const now = Date.now();
    const windowMs = windowSec * 1000;

    // Sliding window — Redis ZADD + ZREMRANGEBYSCORE + ZCARD
    const pipeline = this.redis.pipeline();
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    pipeline.zcard(key);
    pipeline.expire(key, windowSec + 1);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;

    if (count > max) {
      this.logger.warn(
        `Rate limit exceeded | device=${deviceId} | type=${type} | count=${count}/${max}`,
      );
      return false;
    }

    return true;
  }

  public async getCount(
    deviceId: string,
    type: RateLimitType,
  ): Promise<number> {
    const { windowSec } = LIMITS[type];
    const key = `rl:${type}:${deviceId}`;
    const now = Date.now();
    const windowMs = windowSec * 1000;

    await this.redis.zremrangebyscore(key, 0, now - windowMs);
    return this.redis.zcard(key);
  }
}
