import {
  Resolver,
  Query,
  Args,
  ID,
  ObjectType,
  Field,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DataAggregationService } from './data-aggregation.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

export enum AggregationPeriod {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
}

registerEnumType(AggregationPeriod, {
  name: 'AggregationPeriod',
  valuesMap: {
    HOURLY: { description: "Soatlik o'rtacha" },
    DAILY: { description: "Kunlik o'rtacha" },
    MONTHLY: { description: "Oylik o'rtacha" },
  },
});

@ObjectType()
export class AggregatedDataPoint {
  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field(() => Float)
  avgValue: number;

  @Field(() => Float)
  minValue: number;

  @Field(() => Float)
  maxValue: number;

  @Field(() => Int)
  count: number;

  @Field()
  sensorType: string;
}

@Resolver()
export class DataAggregationResolver {
  constructor(private readonly aggService: DataAggregationService) {}

  @Query(() => [AggregatedDataPoint])
  @UseGuards(AuthGuard)
  public async aggregatedSensorData(
    @Args('sensorId', { type: () => ID }) sensorId: string,
    @Args('period', { type: () => AggregationPeriod })
    period: AggregationPeriod,
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<AggregatedDataPoint[]> {
    const result = await this.aggService.getAggregated(
      sensorId,
      period,
      new Date(from),
      new Date(to),
    );
    return result as AggregatedDataPoint[];
  }
}
