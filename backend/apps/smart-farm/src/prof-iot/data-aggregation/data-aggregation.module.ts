import { Module } from '@nestjs/common';
import { DataAggregationResolver } from './data-aggregation.resolver';
import { DataAggregationService } from './data-aggregation.service';

@Module({
  providers: [DataAggregationResolver, DataAggregationService]
})
export class DataAggregationModule {}
