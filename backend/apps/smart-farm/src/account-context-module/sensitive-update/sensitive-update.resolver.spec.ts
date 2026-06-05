import { Test, TestingModule } from '@nestjs/testing';
import { SensitiveUpdateResolver } from './sensitive-update.resolver';

describe('SensitiveUpdateResolver', () => {
  let resolver: SensitiveUpdateResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensitiveUpdateResolver],
    }).compile();

    resolver = module.get<SensitiveUpdateResolver>(SensitiveUpdateResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
