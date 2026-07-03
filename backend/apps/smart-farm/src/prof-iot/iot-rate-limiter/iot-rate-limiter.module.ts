import { Module } from '@nestjs/common';
import { IotRateLimiterResolver } from './iot-rate-limiter.resolver';
import { IotRateLimiterService } from './iot-rate-limiter.service';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [IotRateLimiterResolver, IotRateLimiterService],
  exports: [IotRateLimiterService],
})
export class IotRateLimiterModule {}
