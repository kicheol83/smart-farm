import { Module } from '@nestjs/common';
import { TimeseriesModule } from './timeseries/timeseries.module';
import { MessageBuffersModule } from './message-buffers/message-buffers.module';
import { AnomalyDetectionModule } from './anomaly-detection/anomaly-detection.module';
import { RoomManagerModule } from './room-manager/room-manager.module';
import { CalibrationModule } from './calibration/calibration.module';

@Module({
  imports: [
    TimeseriesModule,
    MessageBuffersModule,
    AnomalyDetectionModule,
    RoomManagerModule,
    CalibrationModule,
  ],
})
export class MidIotModule {}
