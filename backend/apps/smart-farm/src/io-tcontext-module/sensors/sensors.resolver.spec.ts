import { Test, TestingModule } from '@nestjs/testing';
import { SensorsResolver } from './sensors.resolver';

describe('SensorsResolver', () => {
  let resolver: SensorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorsResolver],
    }).compile();

    resolver = module.get<SensorsResolver>(SensorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
