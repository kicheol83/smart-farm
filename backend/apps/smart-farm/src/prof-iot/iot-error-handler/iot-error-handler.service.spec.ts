import { Test, TestingModule } from '@nestjs/testing';
import { IotErrorHandlerService } from './iot-error-handler.service';

describe('IotErrorHandlerService', () => {
  let service: IotErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IotErrorHandlerService],
    }).compile();

    service = module.get<IotErrorHandlerService>(IotErrorHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
