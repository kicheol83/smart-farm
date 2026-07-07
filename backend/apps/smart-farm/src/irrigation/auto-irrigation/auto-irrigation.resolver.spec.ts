import { Test, TestingModule } from '@nestjs/testing';
import { AutoIrrigationResolver } from './auto-irrigation.resolver';

describe('AutoIrrigationResolver', () => {
  let resolver: AutoIrrigationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoIrrigationResolver],
    }).compile();

    resolver = module.get<AutoIrrigationResolver>(AutoIrrigationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
