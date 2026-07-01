import { Test, TestingModule } from '@nestjs/testing';
import { CommandResolver } from './command.resolver';

describe('CommandResolver', () => {
  let resolver: CommandResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommandResolver],
    }).compile();

    resolver = module.get<CommandResolver>(CommandResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
