import { Test, TestingModule } from '@nestjs/testing';
import { ActuatorService } from './actuator.service';

describe('ActuatorService', () => {
  let service: ActuatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActuatorService],
    }).compile();

    service = module.get<ActuatorService>(ActuatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
