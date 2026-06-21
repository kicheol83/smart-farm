import { Test, TestingModule } from '@nestjs/testing';
import { WaterUsageResolver } from './water-usage.resolver';

describe('WaterUsageResolver', () => {
  let resolver: WaterUsageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaterUsageResolver],
    }).compile();

    resolver = module.get<WaterUsageResolver>(WaterUsageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
