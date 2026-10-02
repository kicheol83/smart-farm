import { Module } from '@nestjs/common';
import { SensorDataModule } from '../io-tcontext-module/sensor-data/sensor-data.module';
import { AuthModule } from '../account-context-module/auth/auth.module';
import { IotPipelineModule } from '../iot/iot-pipeline/iot-pipeline.module';
import { ActuatorModule } from '../actuator/actuator.module';
import { MonitoringGateway } from './Monitoring.gateway';

@Module({
  imports: [SensorDataModule, AuthModule, IotPipelineModule, ActuatorModule],
  providers: [MonitoringGateway],
  exports: [MonitoringGateway],
})
export class GatewayModule {}
