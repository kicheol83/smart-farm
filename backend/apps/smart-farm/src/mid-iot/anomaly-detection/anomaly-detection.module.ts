import { Module } from '@nestjs/common';
import { AnomalyDetectionResolver } from './anomaly-detection.resolver';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { AnomalyLogSchema, SensorStatsSchema } from '../../schemas/mid-iot/Anomaly-detection.model';
import SensorDataSchema from '../../schemas/iot/SensorData.model';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sensor_data', schema: SensorDataSchema },
      { name: 'sensorStats', schema: SensorStatsSchema },
      { name: 'anomalyLogs', schema: AnomalyLogSchema },
    ]),
    AuthModule,
  ],
  providers: [AnomalyDetectionResolver, AnomalyDetectionService],
  exports: [AnomalyDetectionService],
})
export class AnomalyDetectionModule {}
