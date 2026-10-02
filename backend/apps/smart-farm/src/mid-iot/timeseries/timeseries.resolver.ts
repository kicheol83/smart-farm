import { Resolver, Query, Args, ID, Int } from '@nestjs/graphql';
import {
  TimeSeriesDataPoint,
  TimeSeriesGranularity,
} from '../../libs/dto/mid-iot/timeseries';
import { TimeseriesService } from './timeseries.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

@Resolver()
@UseGuards(AuthGuard)
export class TimeseriesResolver {
  constructor(private readonly tsService: TimeseriesService) {}

  @Query(() => [TimeSeriesDataPoint])
  public async timeSeriesData(
    @Args('sensorId', { type: () => ID }) sensorId: string,
    @Args('from') from: string,
    @Args('to') to: string,
    @Args('granularity', { type: () => TimeSeriesGranularity })
    granularity: TimeSeriesGranularity,
  ): Promise<TimeSeriesDataPoint[]> {
    return this.tsService.query(
      sensorId,
      new Date(from),
      new Date(to),
      granularity,
    );
  }

  @Query(() => [TimeSeriesDataPoint])
  public async latestSensorReadings(
    @Args('sensorId', { type: () => ID }) sensorId: string,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
  ): Promise<TimeSeriesDataPoint[]> {
    return this.tsService.getLatest(sensorId, limit);
  }
}
