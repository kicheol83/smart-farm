import { Module } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsResolver } from './notification-settings.resolver';
import NotificationSettingsSchema from '../../schemas/iot/NotificationSettings.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'notificationSettings', schema: NotificationSettingsSchema },
    ]),
    AuthModule,
  ],
  providers: [NotificationSettingsService, NotificationSettingsResolver],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
