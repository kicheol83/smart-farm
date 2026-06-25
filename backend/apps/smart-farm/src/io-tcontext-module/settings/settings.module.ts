import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsResolver } from './settings.resolver';
import { GeneralSettingsSchema } from '../../schemas/iot/Settings.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'generalSettings', schema: GeneralSettingsSchema },
    ]),
    AuthModule,
  ],
  providers: [SettingsService, SettingsResolver],
  exports: [SettingsService],
})
export class SettingsModule {}
