import { Test, TestingModule } from '@nestjs/testing';
import { MessageBuffersResolver } from './message-buffers.resolver';

describe('MessageBuffersResolver', () => {
  let resolver: MessageBuffersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageBuffersResolver],
    }).compile();

    resolver = module.get<MessageBuffersResolver>(MessageBuffersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
