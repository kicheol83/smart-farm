import { Test, TestingModule } from '@nestjs/testing';
import { CalibrationService } from './calibration.service';

describe('CalibrationService', () => {
  let service: CalibrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalibrationService],
    }).compile();

    service = module.get<CalibrationService>(CalibrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
