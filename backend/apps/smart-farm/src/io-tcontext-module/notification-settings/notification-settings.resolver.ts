import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationSettingsService } from './notification-settings.service';
import {
  NotificationSettings,
  UpdateNotificationSettingsInput,
} from '../../libs/dto/ops-context-dto/alert-notifications/notification-settings';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';
import { Member } from '../../libs/dto/account-context-dto/member/member';

@Resolver(() => NotificationSettings)
export class NotificationSettingsResolver {
  constructor(private readonly notifService: NotificationSettingsService) {}

  @Query(() => NotificationSettings)
  @UseGuards(AuthGuard)
  public async myNotificationSettings(
    @AuthMember() user: Member,
  ): Promise<NotificationSettings> {
    const result = this.notifService.getOrCreate(
      new Types.ObjectId(user._id),
    ) as any;
    return result;
  }

  @Mutation(() => NotificationSettings)
  @UseGuards(AuthGuard)
  public async updateNotificationSettings(
    @AuthMember() user: Member,
    @Args('input') input: UpdateNotificationSettingsInput,
  ): Promise<NotificationSettings> {
    const result = this.notifService.update(
      new Types.ObjectId(user._id),
      input,
    ) as any;
    return result;
  }
}
