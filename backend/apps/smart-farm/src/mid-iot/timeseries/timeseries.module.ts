import { Module } from '@nestjs/common';
import { TimeseriesService } from './timeseries.service';
import { TimeseriesResolver } from './timeseries.resolver';

@Module({
  providers: [TimeseriesService, TimeseriesResolver]
})
export class TimeseriesModule {}
