import { Test, TestingModule } from '@nestjs/testing';
import { DataAggregationService } from './data-aggregation.service';

describe('DataAggregationService', () => {
  let service: DataAggregationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataAggregationService],
    }).compile();

    service = module.get<DataAggregationService>(DataAggregationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
