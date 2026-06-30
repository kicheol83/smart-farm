import { Module } from '@nestjs/common';
import { IotPipelineService } from './iot-pipeline.service';
import { MongooseModule } from '@nestjs/mongoose';
import SensorDataSchema from '../../schemas/iot/SensorData.model';
import SensorsSchema from '../../schemas/iot/Sensors.model';
import DevicesSchema from '../../schemas/iot/Devices.model';
import GreenHouseSchema from '../../schemas/farm/GreenHouse.model';
import FarmsSchema from '../../schemas/farm/Farms.model';
import AlertsSchema from '../../schemas/ops/Alerts.model';
import AlertNotificationsSchema from '../../schemas/ops/AlertNotifications.model';
import { MqttModule } from '../mqtt/mqtt.module';
import { DeviceAuthModule } from '../device-auth/device-auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sensor_data', schema: SensorDataSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'devices', schema: DevicesSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'farms', schema: FarmsSchema },
      { name: 'alerts', schema: AlertsSchema },
      { name: 'alertNotifications', schema: AlertNotificationsSchema },
    ]),
    MqttModule,
    DeviceAuthModule
  ],
  providers: [IotPipelineService],
  exports: [IotPipelineService],
})
export class IotPipelineModule {}
