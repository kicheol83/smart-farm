import { Test, TestingModule } from '@nestjs/testing';
import { PlantHealthMonitoringResolver } from './plant-health-monitoring.resolver';

describe('PlantHealthMonitoringResolver', () => {
  let resolver: PlantHealthMonitoringResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantHealthMonitoringResolver],
    }).compile();

    resolver = module.get<PlantHealthMonitoringResolver>(PlantHealthMonitoringResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
