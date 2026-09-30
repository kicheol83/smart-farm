import { Module } from '@nestjs/common';
import { SensorDataResolver } from './sensor-data.resolver';
import { SensorDataService } from './sensor-data.service';
import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import { SensorsSchema } from '../../schemas/iot/Sensors.model';
import { SensorDataSchema } from '../../schemas/iot/SensorData.model';

import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { SensorsModule } from '../sensors/sensors.module';
import { DevicesModule } from '../devices/devices.module';
import { GreenhouseModule } from '../../farm-context-module/greenhouse/greenhouse.module';
import DevicesSchema from '../../schemas/iot/Devices.model';
import { ActuatorModule } from '../../actuator/actuator.module';
import { DeviceAuthModule } from '../../iot/device-auth/device-auth.module';
import { DeviceApiKeyGuard } from '../../account-context-module/auth/guards/device.api.key.guard';
import { TimeseriesModule } from '../../mid-iot/timeseries/timeseries.module';
import { AnomalyDetectionModule } from '../../mid-iot/anomaly-detection/anomaly-detection.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sensor_data', schema: SensorDataSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'devices', schema: DevicesSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
    ]),
    AuthModule,
    SensorsModule,
    DevicesModule,
    GreenhouseModule,
    ActuatorModule,
    TimeseriesModule,
    AnomalyDetectionModule,
    DeviceAuthModule,
  ],
  providers: [SensorDataResolver, SensorDataService, DeviceApiKeyGuard],
  exports: [SensorDataService],
})
export class SensorDataModule {}
