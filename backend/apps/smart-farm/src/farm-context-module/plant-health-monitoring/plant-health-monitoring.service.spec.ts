import { Test, TestingModule } from '@nestjs/testing';
import { PlantHealthMonitoringService } from './plant-health-monitoring.service';

describe('PlantHealthMonitoringService', () => {
  let service: PlantHealthMonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantHealthMonitoringService],
    }).compile();

    service = module.get<PlantHealthMonitoringService>(PlantHealthMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
