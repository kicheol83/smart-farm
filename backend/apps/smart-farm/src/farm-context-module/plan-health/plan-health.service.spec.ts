import { Test, TestingModule } from '@nestjs/testing';
import { PlanHealthService } from './plan-health.service';

describe('PlanHealthService', () => {
  let service: PlanHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanHealthService],
    }).compile();

    service = module.get<PlanHealthService>(PlanHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
