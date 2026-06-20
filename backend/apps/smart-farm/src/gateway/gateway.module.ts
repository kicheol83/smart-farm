import { Module } from '@nestjs/common';
import { SensorDataModule } from '../io-tcontext-module/sensor-data/sensor-data.module';
import { MonitoringGateway } from './Monitoring.gateway';

@Module({
  imports: [SensorDataModule],
  providers: [MonitoringGateway],
  exports: [MonitoringGateway],
})
export class GatewayModule {}
