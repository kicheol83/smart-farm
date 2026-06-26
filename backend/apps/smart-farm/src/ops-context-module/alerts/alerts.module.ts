import { Module } from '@nestjs/common';
import { AlertsResolver } from './alerts.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import AlertsSchema from '../../schemas/ops/Alerts.model';
import AlertNotificationsSchema from '../../schemas/ops/AlertNotifications.model';
import DevicesSchema from '../../schemas/iot/Devices.model';
import SensorsSchema from '../../schemas/iot/Sensors.model';
import GreenHouseSchema from '../../schemas/farm/GreenHouse.model';
import FarmsSchema from '../../schemas/farm/Farms.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { AlertsService } from './alerts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'alerts', schema: AlertsSchema },
      { name: 'alertNotifications', schema: AlertNotificationsSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'devices', schema: DevicesSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'farms', schema: FarmsSchema },
    ]),
    AuthModule,
  ],
  providers: [AlertsService, AlertsResolver],
  exports: [AlertsService],
})
export class AlertsModule {}
