import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { SettingsService } from './settings.service';
import {
  GeneralSettings,
  UpdateGeneralSettingsInput,
} from '../../libs/dto/account-context-dto/member-settings/settings';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';
import { Member } from '../../libs/dto/account-context-dto/member/member';

@Resolver(() => GeneralSettings)
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  @Query(() => GeneralSettings)
  @UseGuards(AuthGuard)
  public async mySettings(
    @AuthMember() user: Member,
  ): Promise<GeneralSettings> {
    const result = await this.settingsService.getOrCreate(
      new Types.ObjectId(user._id),
    );
    return result as any;
  }

  @Mutation(() => GeneralSettings)
  @UseGuards(AuthGuard)
  public async updateGeneralSettings(
    @AuthMember() user: Member,
    @Args('input') input: UpdateGeneralSettingsInput,
  ): Promise<GeneralSettings> {
    const result = await this.settingsService.update(
      new Types.ObjectId(user._id),
      input,
    );
    return result as any;
  }

  @Mutation(() => GeneralSettings)
  @UseGuards(AuthGuard)
  public async updateUnitSettings(
    @AuthMember() user: Member,
    @Args('input') input: UpdateGeneralSettingsInput,
  ): Promise<GeneralSettings> {
    const result = await this.settingsService.update(
      new Types.ObjectId(user._id),
      input,
    );
    return result as any;
  }
}
