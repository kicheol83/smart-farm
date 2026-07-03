import { Test, TestingModule } from '@nestjs/testing';
import { IotErrorHandlerResolver } from './iot-error-handler.resolver';

describe('IotErrorHandlerResolver', () => {
  let resolver: IotErrorHandlerResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IotErrorHandlerResolver],
    }).compile();

    resolver = module.get<IotErrorHandlerResolver>(IotErrorHandlerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
