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
import { CalibrationModule } from '../../mid-iot/calibration/calibration.module';
import { AnomalyDetectionModule } from '../../mid-iot/anomaly-detection/anomaly-detection.module';
import { MessageBuffersModule } from '../../mid-iot/message-buffers/message-buffers.module';
import { TimeseriesModule } from '../../mid-iot/timeseries/timeseries.module';
import { IotRateLimiterModule } from '../../prof-iot/iot-rate-limiter/iot-rate-limiter.module';
import { IotErrorHandlerModule } from '../../prof-iot/iot-error-handler/iot-error-handler.module';
import { ActuatorModule } from '../../actuator/actuator.module';

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
    ActuatorModule,
    DeviceAuthModule,
    TimeseriesModule,
    MessageBuffersModule,
    AnomalyDetectionModule,
    CalibrationModule,
    IotRateLimiterModule,
    IotErrorHandlerModule,
  ],
  providers: [IotPipelineService],
  exports: [IotPipelineService],
})
export class IotPipelineModule {}
