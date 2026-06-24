import { Module } from '@nestjs/common';
import { NdviService } from './ndvi.service';
import { NdviResolver } from './ndvi.resolver';
import { MapSectorSchema } from '../../schemas/farm/Map.model';
import { MongooseModule } from '@nestjs/mongoose';
import { NdviAnalyticsSchema } from '../../schemas/farm/Ndvi.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import FieldsSchema from '../../schemas/farm/Fields.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ndviAnalytics', schema: NdviAnalyticsSchema },
      { name: 'mapSectors', schema: MapSectorSchema },
      { name: 'fields', schema: FieldsSchema },
    ]),
    AuthModule,
  ],
  providers: [NdviService, NdviResolver],
  exports: [NdviService],
})
export class NdviModule {}
