import { Test, TestingModule } from '@nestjs/testing';
import { PlanHealthResolver } from './plan-health.resolver';

describe('PlanHealthResolver', () => {
  let resolver: PlanHealthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanHealthResolver],
    }).compile();

    resolver = module.get<PlanHealthResolver>(PlanHealthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
