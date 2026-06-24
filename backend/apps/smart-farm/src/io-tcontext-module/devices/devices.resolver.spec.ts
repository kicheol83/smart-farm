import { Test, TestingModule } from '@nestjs/testing';
import { DevicesResolver } from './devices.resolver';

describe('DevicesResolver', () => {
  let resolver: DevicesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesResolver],
    }).compile();

    resolver = module.get<DevicesResolver>(DevicesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
