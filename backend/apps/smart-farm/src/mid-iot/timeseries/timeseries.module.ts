import { Module } from '@nestjs/common';
import { TimeseriesService } from './timeseries.service';
import { TimeseriesResolver } from './timeseries.resolver';
import { TimeSeriesSensorSchema } from '../../schemas/mid-iot/Timeseries.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'timeSeriesSensorData', schema: TimeSeriesSensorSchema },
    ]),
    AuthModule,
  ],
  providers: [TimeseriesService, TimeseriesResolver],
  exports: [TimeseriesService],
})
export class TimeseriesModule {}
