import { Test, TestingModule } from '@nestjs/testing';
import { ActionLogResolver } from './action-log.resolver';

describe('ActionLogResolver', () => {
  let resolver: ActionLogResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionLogResolver],
    }).compile();

    resolver = module.get<ActionLogResolver>(ActionLogResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
