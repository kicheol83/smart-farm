import { Module } from '@nestjs/common';
import { AnomalyDetectionResolver } from './anomaly-detection.resolver';
import { AnomalyDetectionService } from './anomaly-detection.service';

@Module({
  providers: [AnomalyDetectionResolver, AnomalyDetectionService]
})
export class AnomalyDetectionModule {}
