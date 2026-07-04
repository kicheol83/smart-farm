import { Test, TestingModule } from '@nestjs/testing';
import { MqttQosResolver } from './mqtt-qos.resolver';

describe('MqttQosResolver', () => {
  let resolver: MqttQosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MqttQosResolver],
    }).compile();

    resolver = module.get<MqttQosResolver>(MqttQosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
