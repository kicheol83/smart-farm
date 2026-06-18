import { Test, TestingModule } from '@nestjs/testing';
import { SectionsResolver } from './sections.resolver';

describe('SectionsResolver', () => {
  let resolver: SectionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectionsResolver],
    }).compile();

    resolver = module.get<SectionsResolver>(SectionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
