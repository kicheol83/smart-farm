import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisService } from './ai-analysis.service';

describe('AiAnalysisService', () => {
  let service: AiAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiAnalysisService],
    }).compile();

    service = module.get<AiAnalysisService>(AiAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
