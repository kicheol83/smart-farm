import { Module } from '@nestjs/common';
import { SectionsResolver } from './sections.resolver';
import { SectionsService } from './sections.service';
import { SectionsSchema } from '../../schemas/farm/Sections.model';
import { MongooseModule } from '@nestjs/mongoose';
import GreenHouseSchema from '../../schemas/farm/GreenHouse.model';
import PlantHealthSchema from '../../schemas/farm/PlantHealth';
import SensorDataSchema from '../../schemas/iot/SensorData.model';
import SensorsSchema from '../../schemas/iot/Sensors.model';
import DevicesSchema from '../../schemas/iot/Devices.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import CropsSchema from '../../schemas/farm/Crops.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sections', schema: SectionsSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'plantHealth', schema: PlantHealthSchema },
      { name: 'sensor_data', schema: SensorDataSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'devices', schema: DevicesSchema },
      {
        name: 'crops',
        schema: CropsSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [SectionsResolver, SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
