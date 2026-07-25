import { Module } from '@nestjs/common';
import { WaterUsageResolver } from './water-usage.resolver';
import { WaterUsageService } from './water-usage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import WaterUsageSchema from '../../schemas/farm/WaterUsage';
import SectionsSchema from '../../schemas/farm/Sections.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'waterUsages', schema: WaterUsageSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'sections', schema: SectionsSchema },
    ]),
    AuthModule,
  ],
  providers: [WaterUsageResolver, WaterUsageService],
  exports: [WaterUsageService],
})
export class WaterUsageModule {}
