import { Test, TestingModule } from '@nestjs/testing';
import { AutoIrrigationService } from './auto-irrigation.service';

describe('AutoIrrigationService', () => {
  let service: AutoIrrigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoIrrigationService],
    }).compile();

    service = module.get<AutoIrrigationService>(AutoIrrigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
