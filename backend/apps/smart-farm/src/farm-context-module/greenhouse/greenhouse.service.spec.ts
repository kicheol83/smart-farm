import { Test, TestingModule } from '@nestjs/testing';
import { GreenhouseService } from './greenhouse.service';

describe('GreenhouseService', () => {
  let service: GreenhouseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GreenhouseService],
    }).compile();

    service = module.get<GreenhouseService>(GreenhouseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
