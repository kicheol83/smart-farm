import { Module } from '@nestjs/common';
import { CalibrationService } from './calibration.service';
import { CalibrationResolver } from './calibration.resolver';
import { SensorCalibrationSchema } from '../../schemas/mid-iot/Calibration.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'sensorCalibrations', schema: SensorCalibrationSchema },
    ]),
  ],
  providers: [CalibrationService, CalibrationResolver],
  exports: [CalibrationService],
})
export class CalibrationModule {}
