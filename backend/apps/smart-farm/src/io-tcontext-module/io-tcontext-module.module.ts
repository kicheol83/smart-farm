import { Module } from '@nestjs/common';
import { DevicesModule } from './devices/devices.module';
import { SensorsModule } from './sensors/sensors.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';
import { CameraModule } from './camera/camera.module';
import { CameraSnapshotsModule } from './camera-snapshots/camera-snapshots.module';
import { SettingsModule } from './settings/settings.module';
import { ActionLogModule } from './action-log/action-log.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';

@Module({
  imports: [DevicesModule, SensorsModule, SensorDataModule, CameraModule, CameraSnapshotsModule, SettingsModule, ActionLogModule, NotificationSettingsModule]
})
export class IoTcontextModuleModule {}
