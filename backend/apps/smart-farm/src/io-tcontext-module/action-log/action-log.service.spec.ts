import { Test, TestingModule } from '@nestjs/testing';
import { ActionLogService } from './action-log.service';

describe('ActionLogService', () => {
  let service: ActionLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionLogService],
    }).compile();

    service = module.get<ActionLogService>(ActionLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
