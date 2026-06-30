import { Module } from '@nestjs/common';
import { DeviceAuthService } from './device-auth.service';

@Module({
  providers: [DeviceAuthService]
})
export class DeviceAuthModule {}
