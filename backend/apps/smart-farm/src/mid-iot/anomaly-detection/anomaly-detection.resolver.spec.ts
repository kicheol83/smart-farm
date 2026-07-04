import { Test, TestingModule } from '@nestjs/testing';
import { AnomalyDetectionResolver } from './anomaly-detection.resolver';

describe('AnomalyDetectionResolver', () => {
  let resolver: AnomalyDetectionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnomalyDetectionResolver],
    }).compile();

    resolver = module.get<AnomalyDetectionResolver>(AnomalyDetectionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
