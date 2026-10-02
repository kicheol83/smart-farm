import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import DevicesSchema from '../../schemas/iot/Devices.model';
import { SensorsSchema } from '../../schemas/iot/Sensors.model';
import { SensorDataSchema } from '../../schemas/iot/SensorData.model';
import { AnomalyLogSchema, SensorStatsSchema } from '../../schemas/mid-iot/Anomaly-detection.model';
import { SystemErrorLogSchema } from '../../prof-iot/iot-error-handler/iot-error-handler.service';
import { PipelineOverviewService } from './pipeline-overview.service';
import { PipelineOverviewResolver } from './pipeline-overview.resolver';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'devices', schema: DevicesSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'sensor_data', schema: SensorDataSchema },
      { name: 'sensorStats', schema: SensorStatsSchema },
      { name: 'anomalyLogs', schema: AnomalyLogSchema },
      { name: 'systemErrorLogs', schema: SystemErrorLogSchema },
    ]),
  ],
  providers: [PipelineOverviewService, PipelineOverviewResolver],
})
export class PipelineOverviewModule {}
