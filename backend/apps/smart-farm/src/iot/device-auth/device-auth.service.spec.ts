import { Test, TestingModule } from '@nestjs/testing';
import { DeviceAuthService } from './device-auth.service';

describe('DeviceAuthService', () => {
  let service: DeviceAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceAuthService],
    }).compile();

    service = module.get<DeviceAuthService>(DeviceAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
