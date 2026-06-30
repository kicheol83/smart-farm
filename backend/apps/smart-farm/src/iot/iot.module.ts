import { Module } from '@nestjs/common';
import { MqttModule } from './mqtt/mqtt.module';
import { DeviceAuthModule } from './device-auth/device-auth.module';
import { IotPipelineModule } from './iot-pipeline/iot-pipeline.module';
import { HeartBeatModule } from '../heart-beat/heart-beat.module';
import { CommandModule } from './command/command.module';

@Module({
  imports: [
    MqttModule,
    DeviceAuthModule,
    IotPipelineModule,
    HeartBeatModule,
    CommandModule,
  ],
  exports: [
    MqttModule,
    DeviceAuthModule,
    IotPipelineModule,
    HeartBeatModule,
    CommandModule,
  ],
})
export class IotModule {}
