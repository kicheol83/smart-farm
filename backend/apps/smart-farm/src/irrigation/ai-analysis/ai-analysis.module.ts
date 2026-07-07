import { Module } from '@nestjs/common';
import { AiAnalysisResolver } from './ai-analysis.resolver';
import { AiAnalysisService, IrrigationLogSchema } from './ai-analysis.service';
import { MongooseModule } from '@nestjs/mongoose';
import SensorDataSchema from '../../schemas/iot/SensorData.model';
import SensorsSchema from '../../schemas/iot/Sensors.model';
import { DevicesSchema } from '../../schemas/iot/Devices.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sensor_data', schema: SensorDataSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'devices', schema: DevicesSchema },
      { name: 'irrigationLogs', schema: IrrigationLogSchema },
    ]),
    AuthModule,
  ],
  providers: [AiAnalysisResolver, AiAnalysisService],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
