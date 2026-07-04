import { Test, TestingModule } from '@nestjs/testing';
import { TimeseriesResolver } from './timeseries.resolver';

describe('TimeseriesResolver', () => {
  let resolver: TimeseriesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeseriesResolver],
    }).compile();

    resolver = module.get<TimeseriesResolver>(TimeseriesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
