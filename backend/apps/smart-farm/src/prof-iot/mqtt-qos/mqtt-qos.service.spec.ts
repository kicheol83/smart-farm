import { Test, TestingModule } from '@nestjs/testing';
import { MqttQosService } from './mqtt-qos.service';

describe('MqttQosService', () => {
  let service: MqttQosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MqttQosService],
    }).compile();

    service = module.get<MqttQosService>(MqttQosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
