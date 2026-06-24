import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesResolver } from './devices.resolver';
import { SensorsSchema } from '../../schemas/iot/Sensors.model';
import { MongooseModule } from '@nestjs/mongoose';
import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import DevicesSchema from '../../schemas/iot/Devices.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'devices', schema: DevicesSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'sensors', schema: SensorsSchema },
    ]),
    AuthModule,
  ],
  providers: [DevicesService, DevicesResolver],
  exports: [DevicesService],
})
export class DevicesModule {}
