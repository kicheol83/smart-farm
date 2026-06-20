import { Test, TestingModule } from '@nestjs/testing';
import { SensorDataResolver } from './sensor-data.resolver';

describe('SensorDataResolver', () => {
  let resolver: SensorDataResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorDataResolver],
    }).compile();

    resolver = module.get<SensorDataResolver>(SensorDataResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
