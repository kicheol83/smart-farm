import { Module } from '@nestjs/common';
import { CalibrationService } from './calibration.service';
import { CalibrationResolver } from './calibration.resolver';

@Module({
  providers: [CalibrationService, CalibrationResolver]
})
export class CalibrationModule {}
