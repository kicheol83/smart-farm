import { Module } from '@nestjs/common';
import { DataAggregationResolver } from './data-aggregation.resolver';
import { DataAggregationService } from './data-aggregation.service';
import { MongooseModule } from '@nestjs/mongoose';
import SensorDataSchema from '../../schemas/iot/SensorData.model';
import SensorsSchema from '../../schemas/iot/Sensors.model';
import AggregatedSensorDataSchema from '../../schemas/aggregated.sensor.model';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: 'sensor_data', schema: SensorDataSchema },
      { name: 'sensors', schema: SensorsSchema },
      { name: 'aggregatedSensorData', schema: AggregatedSensorDataSchema },
    ]),
    AuthModule,
  ],
  providers: [DataAggregationResolver, DataAggregationService],
  exports: [DataAggregationService],
})
export class DataAggregationModule {}
