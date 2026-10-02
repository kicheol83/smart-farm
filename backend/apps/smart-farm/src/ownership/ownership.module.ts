import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import FarmsSchema from '../schemas/farm/Farms.model';
import { GreenHouseSchema } from '../schemas/farm/GreenHouse.model';
import { SectionsSchema } from '../schemas/farm/Sections.model';
import DevicesSchema from '../schemas/iot/Devices.model';
import { SensorsSchema } from '../schemas/iot/Sensors.model';
import CameraSchema from '../schemas/iot/Camera.model';
import ActuatorsSchema from '../schemas/ops/Actuators.model';
import AutomationRulesSchema from '../schemas/ops/AutomationRules.model';
import TasksSchema from '../schemas/ops/Task.model';
import { AnomalyLogSchema } from '../schemas/mid-iot/Anomaly-detection.model';
import { OwnershipService } from './ownership.service';
import { OwnershipInterceptor } from './ownership.interceptor';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'farms', schema: FarmsSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'sections', schema: SectionsSchema },
      { name: 'devices', schema: DevicesSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'cameras', schema: CameraSchema },
      { name: 'actuators', schema: ActuatorsSchema },
      { name: 'automationRules', schema: AutomationRulesSchema },
      { name: 'tasks', schema: TasksSchema },
      { name: 'anomalyLogs', schema: AnomalyLogSchema },
    ]),
  ],
  providers: [
    OwnershipService,
    { provide: APP_INTERCEPTOR, useClass: OwnershipInterceptor },
  ],
  exports: [OwnershipService],
})
export class OwnershipModule {}
