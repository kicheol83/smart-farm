import { Test, TestingModule } from '@nestjs/testing';
import { WaterUsageService } from './water-usage.service';

describe('WaterUsageService', () => {
  let service: WaterUsageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaterUsageService],
    }).compile();

    service = module.get<WaterUsageService>(WaterUsageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
