import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsResolver } from './sensors.resolver';
import { SensorsSchema } from '../../schemas/iot/Sensors.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { DevicesModule } from '../devices/devices.module';
import DevicesSchema from '../../schemas/iot/Devices.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sensors', schema: SensorsSchema },
      {
        name: 'devices',
        schema: DevicesSchema,
      },
    ]),
    AuthModule,
    DevicesModule,
  ],
  providers: [SensorsService, SensorsResolver],
  exports: [SensorsService],
})
export class SensorsModule {}
