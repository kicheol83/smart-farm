import { Module } from '@nestjs/common';
import { DevicesModule } from './devices/devices.module';
import { SensorsModule } from './sensors/sensors.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';
import { CameraModule } from './camera/camera.module';
import { CameraSnapshotsModule } from './camera-snapshots/camera-snapshots.module';

@Module({
  imports: [DevicesModule, SensorsModule, SensorDataModule, CameraModule, CameraSnapshotsModule]
})
export class IoTcontextModuleModule {}
