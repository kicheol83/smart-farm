import { Test, TestingModule } from '@nestjs/testing';
import { GreenhouseResolver } from './greenhouse.resolver';

describe('GreenhouseResolver', () => {
  let resolver: GreenhouseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GreenhouseResolver],
    }).compile();

    resolver = module.get<GreenhouseResolver>(GreenhouseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
