import { Module } from '@nestjs/common';
import { FieldMapResolver } from './field-map.resolver';
import { FieldMapService } from './field-map.service';
import { NdviAnalyticsSchema } from '../../schemas/farm/Ndvi.model';
import { MongooseModule } from '@nestjs/mongoose';
import { MapSectorSchema } from '../../schemas/farm/Map.model';
import { FarmsSchema } from '../../schemas/farm/Farms.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { FarmsModule } from '../farms/farms.module';
import FieldMapSchema from '../../schemas/farm/FieldsMap.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'fieldMaps', schema: FieldMapSchema },
      { name: 'mapSectors', schema: MapSectorSchema },
      { name: 'ndviAnalytics', schema: NdviAnalyticsSchema },
      { name: 'farm', schema: FarmsSchema },
    ]),
    AuthModule,
    FarmsModule,
  ],
  providers: [FieldMapResolver, FieldMapService],
  exports: [FieldMapService],
})
export class FieldMapModule {}
