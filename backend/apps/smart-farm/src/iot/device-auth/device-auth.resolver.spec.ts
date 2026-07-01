import { Test, TestingModule } from '@nestjs/testing';
import { DeviceAuthResolver } from './device-auth.resolver';

describe('DeviceAuthResolver', () => {
  let resolver: DeviceAuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceAuthResolver],
    }).compile();

    resolver = module.get<DeviceAuthResolver>(DeviceAuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
