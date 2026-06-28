import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../schemas/account/Member.model';
import FarmsSchema from '../schemas/farm/Farms.model';
import GreenHouseSchema from '../schemas/farm/GreenHouse.model';
import DevicesSchema from '../schemas/iot/Devices.model';
import SensorsSchema from '../schemas/iot/Sensors.model';
import AlertsSchema from '../schemas/ops/Alerts.model';
import AlertNotificationsSchema from '../schemas/ops/AlertNotifications.model';
import TasksSchema from '../schemas/ops/Task.model';
import { RolesGuard } from '../account-context-module/auth/guards/roles.guard';
import { AuthModule } from '../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Member', schema: MemberSchema },
      { name: 'farms', schema: FarmsSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'devices', schema: DevicesSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'alerts', schema: AlertsSchema },
      { name: 'alertNotifications', schema: AlertNotificationsSchema },
      { name: 'tasks', schema: TasksSchema },
    ]),
    AuthModule,
  ],
  providers: [AdminService, AdminResolver, RolesGuard],
})
export class AdminModule {}
