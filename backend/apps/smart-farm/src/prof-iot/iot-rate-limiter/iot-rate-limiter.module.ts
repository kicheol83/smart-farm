import { Module } from '@nestjs/common';
import { IotRateLimiterResolver } from './iot-rate-limiter.resolver';
import { IotRateLimiterService } from './iot-rate-limiter.service';

@Module({
  providers: [IotRateLimiterResolver, IotRateLimiterService]
})
export class IotRateLimiterModule {}
