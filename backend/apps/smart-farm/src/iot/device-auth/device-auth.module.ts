import { Module } from '@nestjs/common';
import { DeviceAuthService } from './device-auth.service';
import { DevicesService } from '../../io-tcontext-module/devices/devices.service';
import { MongooseModule } from '@nestjs/mongoose';
import DeviceApiKeySchema from '../../schemas/DeviceApiKey.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "deviceApiKeys",
        schema: DeviceApiKeySchema,
      },
    ]),
  ],
  providers: [DeviceAuthService],
  exports: [DeviceAuthService]
})
export class DeviceAuthModule {}
