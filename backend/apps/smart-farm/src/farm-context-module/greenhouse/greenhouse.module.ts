import { Module } from '@nestjs/common';
import { GreenhouseService } from './greenhouse.service';
import { GreenhouseResolver } from './greenhouse.resolver';
import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { FarmsSchema } from '../../schemas/farm/Farms.model';
import { FarmsModule } from '../farms/farms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'greenHouses', schema: GreenHouseSchema },
      { name: 'farms', schema: FarmsSchema },
    ]),
    AuthModule,
    FarmsModule,
  ],
  providers: [GreenhouseService, GreenhouseResolver],
  exports: [GreenhouseService],
})
export class GreenhouseModule {}
