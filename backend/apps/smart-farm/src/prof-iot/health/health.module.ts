import { Module } from '@nestjs/common';
import { HealthResolver } from './health.resolver';
import { HealthService } from './health.service';
import { MqttModule } from '../../iot/mqtt/mqtt.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [MqttModule, AuthModule],
  providers: [HealthResolver, HealthService],
  exports: [HealthService],
})
export class HealthModule {}
