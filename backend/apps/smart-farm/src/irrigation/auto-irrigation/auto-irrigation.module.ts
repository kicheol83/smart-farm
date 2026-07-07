import { Module } from '@nestjs/common';
import { AutoIrrigationResolver } from './auto-irrigation.resolver';
import { AutoIrrigationService } from './auto-irrigation.service';
import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import { DevicesSchema } from '../../schemas/iot/Devices.model';
import { MongooseModule } from '@nestjs/mongoose';
import { MqttModule } from '../../iot/mqtt/mqtt.module';
import { AiAnalysisModule } from '../ai-analysis/ai-analysis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AiAnalysisModule,
    MqttModule,
    MongooseModule.forFeature([
      { name: 'devices', schema: DevicesSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
    ]),
    AuthModule,
  ],
  providers: [AutoIrrigationResolver, AutoIrrigationService],
  exports: [AutoIrrigationService],
})
export class AutoIrrigationModule {}
