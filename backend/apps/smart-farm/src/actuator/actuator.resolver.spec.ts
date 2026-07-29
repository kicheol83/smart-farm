import { Test, TestingModule } from '@nestjs/testing';
import { ActuatorResolver } from './actuator.resolver';

describe('ActuatorResolver', () => {
  let resolver: ActuatorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActuatorResolver],
    }).compile();

    resolver = module.get<ActuatorResolver>(ActuatorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
