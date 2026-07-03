import { Test, TestingModule } from '@nestjs/testing';
import { IotRateLimiterResolver } from './iot-rate-limiter.resolver';

describe('IotRateLimiterResolver', () => {
  let resolver: IotRateLimiterResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IotRateLimiterResolver],
    }).compile();

    resolver = module.get<IotRateLimiterResolver>(IotRateLimiterResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
