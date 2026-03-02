import { Module } from '@nestjs/common';
import { MemberSettingsResolver } from './member-settings.resolver';
import { MemberSettingsService } from './member-settings.service';

@Module({
  providers: [MemberSettingsResolver, MemberSettingsService]
})
export class MemberSettingsModule {}
