import { Test, TestingModule } from '@nestjs/testing';
import { IotPipelineService } from './iot-pipeline.service';

describe('IotPipelineService', () => {
  let service: IotPipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IotPipelineService],
    }).compile();

    service = module.get<IotPipelineService>(IotPipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
