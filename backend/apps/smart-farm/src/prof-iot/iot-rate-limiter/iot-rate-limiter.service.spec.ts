import { Test, TestingModule } from '@nestjs/testing';
import { IotRateLimiterService } from './iot-rate-limiter.service';

describe('IotRateLimiterService', () => {
  let service: IotRateLimiterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IotRateLimiterService],
    }).compile();

    service = module.get<IotRateLimiterService>(IotRateLimiterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
