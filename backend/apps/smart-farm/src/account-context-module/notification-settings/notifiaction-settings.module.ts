import { Module } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsResolver } from './notification-settings.resolver';

@Module({
  providers: [NotificationSettingsService, NotificationSettingsResolver]
})
export class NotifiactionSettingsModule {}
