import { Test, TestingModule } from '@nestjs/testing';
import { DataAggregationResolver } from './data-aggregation.resolver';

describe('DataAggregationResolver', () => {
  let resolver: DataAggregationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataAggregationResolver],
    }).compile();

    resolver = module.get<DataAggregationResolver>(DataAggregationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
