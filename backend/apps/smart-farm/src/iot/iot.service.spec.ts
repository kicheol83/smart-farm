import { Test, TestingModule } from '@nestjs/testing';
import { IotService } from './iot.service';

describe('IotService', () => {
  let service: IotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IotService],
    }).compile();

    service = module.get<IotService>(IotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
