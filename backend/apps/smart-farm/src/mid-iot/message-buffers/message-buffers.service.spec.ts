import { Test, TestingModule } from '@nestjs/testing';
import { MessageBuffersService } from './message-buffers.service';

describe('MessageBuffersService', () => {
  let service: MessageBuffersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageBuffersService],
    }).compile();

    service = module.get<MessageBuffersService>(MessageBuffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
