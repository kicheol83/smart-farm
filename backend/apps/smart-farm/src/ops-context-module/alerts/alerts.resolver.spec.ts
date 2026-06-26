import { Test, TestingModule } from '@nestjs/testing';
import { AlertsResolver } from './alerts.resolver';

describe('AlertsResolver', () => {
  let resolver: AlertsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertsResolver],
    }).compile();

    resolver = module.get<AlertsResolver>(AlertsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
