import { Test, TestingModule } from '@nestjs/testing';
import { SensitiveUpdateService } from './sensitive-update.service';

describe('SensitiveUpdateService', () => {
  let service: SensitiveUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensitiveUpdateService],
    }).compile();

    service = module.get<SensitiveUpdateService>(SensitiveUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
