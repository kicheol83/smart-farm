import { Test, TestingModule } from '@nestjs/testing';
import { AppleService } from './apple.service';

describe('AppleService', () => {
  let service: AppleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppleService],
    }).compile();

    service = module.get<AppleService>(AppleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
