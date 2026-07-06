import { Module } from '@nestjs/common';
import { CalibrationService } from './calibration.service';
import { CalibrationResolver } from './calibration.resolver';
import { SensorCalibrationSchema } from '../../schemas/mid-iot/Calibration.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sensorCalibrations', schema: SensorCalibrationSchema },
    ]),
  ],
  providers: [CalibrationService, CalibrationResolver],
  exports: [CalibrationService],
})
export class CalibrationModule {}
