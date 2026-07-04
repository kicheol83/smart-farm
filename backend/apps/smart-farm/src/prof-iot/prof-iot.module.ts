import { Module } from '@nestjs/common';
import { IotRateLimiterModule } from './iot-rate-limiter/iot-rate-limiter.module';
import { DataAggregationModule } from './data-aggregation/data-aggregation.module';
import { IotErrorHandlerModule } from './iot-error-handler/iot-error-handler.module';
import { HealthModule } from './health/health.module';
import { MqttQosModule } from './mqtt-qos/mqtt-qos.module';

@Module({
  imports: [
    IotRateLimiterModule,
    DataAggregationModule,
    IotErrorHandlerModule,
    HealthModule,
    MqttQosModule,
  ],
})
export class ProfIotModule {}
