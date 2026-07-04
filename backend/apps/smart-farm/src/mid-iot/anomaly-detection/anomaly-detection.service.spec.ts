import { Test, TestingModule } from '@nestjs/testing';
import { AnomalyDetectionService } from './anomaly-detection.service';

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnomalyDetectionService],
    }).compile();

    service = module.get<AnomalyDetectionService>(AnomalyDetectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
