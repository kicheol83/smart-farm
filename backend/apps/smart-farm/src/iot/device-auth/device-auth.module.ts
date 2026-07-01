import { Module } from '@nestjs/common';
import { DeviceAuthService } from './device-auth.service';
import { DevicesService } from '../../io-tcontext-module/devices/devices.service';
import { MongooseModule } from '@nestjs/mongoose';
import DeviceApiKeySchema from '../../schemas/DeviceApiKey.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { DeviceAuthResolver } from '../../iot/device-auth/device-auth.resolver';
import DevicesSchema from '../../schemas/iot/Devices.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'deviceApiKeys',
        schema: DeviceApiKeySchema,
      },
      {
        name: 'devices',
        schema: DevicesSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [DeviceAuthService, DeviceAuthResolver],
  exports: [DeviceAuthService],
})
export class DeviceAuthModule {}
