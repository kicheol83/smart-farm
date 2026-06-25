import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSettingsResolver } from './notification-settings.resolver';

describe('NotificationSettingsResolver', () => {
  let resolver: NotificationSettingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationSettingsResolver],
    }).compile();

    resolver = module.get<NotificationSettingsResolver>(NotificationSettingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
