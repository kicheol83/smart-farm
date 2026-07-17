import { Module } from '@nestjs/common';
import { HeartBeatService } from './heart-beat.service';
import { DeviceAuthModule } from '../iot/device-auth/device-auth.module';
import { MqttModule } from '../iot/mqtt/mqtt.module';
import { DevicesSchema } from '../schemas/iot/Devices.model';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'devices', schema: DevicesSchema }]),
    MqttModule,
    DeviceAuthModule,
  ],
  providers: [HeartBeatService],
  exports: [HeartBeatService],
})
export class HeartBeatModule {}
