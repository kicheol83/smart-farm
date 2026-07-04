import { Test, TestingModule } from '@nestjs/testing';
import { CalibrationResolver } from './calibration.resolver';

describe('CalibrationResolver', () => {
  let resolver: CalibrationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalibrationResolver],
    }).compile();

    resolver = module.get<CalibrationResolver>(CalibrationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
