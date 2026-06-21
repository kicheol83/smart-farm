import { Test, TestingModule } from '@nestjs/testing';
import { ReportsResolver } from './reports.resolver';

describe('ReportsResolver', () => {
  let resolver: ReportsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsResolver],
    }).compile();

    resolver = module.get<ReportsResolver>(ReportsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
