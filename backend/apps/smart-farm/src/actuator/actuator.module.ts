import { Module } from '@nestjs/common';
import { ActuatorService } from './actuator.service';
import { ActuatorResolver } from './actuator.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import ActuatorsSchema from '../schemas/ops/Actuators.model';
import AutomationRulesSchema from '../schemas/ops/AutomationRules.model';
import DevicesSchema from '../schemas/iot/Devices.model';
import WaterUsageSchema from '../schemas/farm/WaterUsage';
import { ActionLogModule } from '../io-tcontext-module/action-log/action-log.module';
import { DeviceAuthModule } from '../iot/device-auth/device-auth.module';
import { AuthModule } from '../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'actuators', schema: ActuatorsSchema },
      { name: 'automationRules', schema: AutomationRulesSchema },
      { name: 'devices', schema: DevicesSchema },
      { name: 'waterUsages', schema: WaterUsageSchema },
    ]),
    ActionLogModule,
    DeviceAuthModule,
    AuthModule
  ],
  providers: [ActuatorResolver, ActuatorService],
  exports: [ActuatorService],
})
export class ActuatorModule {}
