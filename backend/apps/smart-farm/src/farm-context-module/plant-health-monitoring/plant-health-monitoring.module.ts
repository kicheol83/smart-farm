import { Module } from '@nestjs/common';
import { PlantHealthMonitoringResolver } from './plant-health-monitoring.resolver';
import { PlantHealthMonitoringService } from './plant-health-monitoring.service';
import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import { MongooseModule } from '@nestjs/mongoose';
import PlantHealthSchema from '../../schemas/farm/PlantHealth';
import { SectionsSchema } from '../../schemas/farm/Sections.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { FieldsSchema } from '../../schemas/farm/Fields.model';
import { FieldsModule } from '../fields/fields.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'plantHealth', schema: PlantHealthSchema },
      { name: 'sections', schema: SectionsSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'fields', schema: FieldsSchema },
    ]),
    AuthModule,
    FieldsModule,
  ],
  providers: [PlantHealthMonitoringResolver, PlantHealthMonitoringService],
  exports: [PlantHealthMonitoringService],
})
export class PlantHealthMonitoringModule {}
