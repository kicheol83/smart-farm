import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisResolver } from './ai-analysis.resolver';

describe('AiAnalysisResolver', () => {
  let resolver: AiAnalysisResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiAnalysisResolver],
    }).compile();

    resolver = module.get<AiAnalysisResolver>(AiAnalysisResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
