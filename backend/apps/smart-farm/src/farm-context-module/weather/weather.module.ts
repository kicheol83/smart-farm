import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import DevicesSchema from '../../schemas/iot/Devices.model';
import { WeatherService } from './weather.service';
import { WeatherResolver } from './weather.resolver';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: 'devices', schema: DevicesSchema }])],
  providers: [WeatherService, WeatherResolver],
})
export class WeatherModule {}
