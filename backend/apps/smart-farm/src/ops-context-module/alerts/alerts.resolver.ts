import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ActiveAlertsSummary,
  Alert,
  AlertNotification,
  CheckSensorThresholdInput,
  CreateAlertInput,
  GetAlertNotificationsInput,
  PaginatedAlertNotifications,
} from '../../libs/dto/ops-context-dto/alerts/alert';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { AlertsService } from './alerts.service';

import { OwnedBy } from '../../ownership/owned-by.decorator';
@Resolver()
export class AlertsResolver {
  constructor(private readonly alertService: AlertsService) {}

  @Mutation(() => Alert, {})
  @UseGuards(AuthGuard)
  public async createAlert(
    @Args('input') input: CreateAlertInput,
  ): Promise<Alert> {
    const result = this.alertService.create(input) as any;
    return result;
  }

  @Query(() => [Alert], {})
  @UseGuards(AuthGuard)
  public async alertsBySensor(
    @Args('sensorsId', { type: () => ID }) sensorsId: string,
  ): Promise<Alert[]> {
    const result = this.alertService.findBySensor(sensorsId) as any;
    return result;
  }

  @Mutation(() => Boolean, {})
  @UseGuards(AuthGuard)
  @OwnedBy('alert')
  public async deleteAlert(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = this.alertService.remove(id);
    return result;
  }

  @Mutation(() => Alert, {
    nullable: true,
  })
  @UseGuards(AuthGuard)
  public async checkSensorThreshold(
    @Args('input') input: CheckSensorThresholdInput,
  ): Promise<Alert | null> {
    const result = this.alertService.checkThreshold(input) as any;
    return result;
  }

  @Query(() => PaginatedAlertNotifications, {})
  @UseGuards(AuthGuard)
  public async myAlertNotifications(
    @AuthMember() user: Member,
    @Args('input') input: GetAlertNotificationsInput,
  ): Promise<PaginatedAlertNotifications> {
    const result = this.alertService.findNotifications(
      new Types.ObjectId(user._id),
      input,
    );
    return result;
  }

  @Mutation(() => AlertNotification, {})
  @UseGuards(AuthGuard)
  public async markNotificationAsRead(
    @AuthMember() user: Member,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AlertNotification> {
    const result = this.alertService.markAsRead(
      id,
      new Types.ObjectId(user._id),
    ) as any;
    return result;
  }

  @Mutation(() => Number, {})
  @UseGuards(AuthGuard)
  public async markAllNotificationsAsRead(
    @AuthMember() user: Member,
  ): Promise<number> {
    const result = this.alertService.markAllAsRead(
      new Types.ObjectId(user._id),
    );
    return result;
  }

  @Query(() => ActiveAlertsSummary, {})
  @UseGuards(AuthGuard)
  public async activeAlertsSummary(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<ActiveAlertsSummary> {
    const result = this.alertService.getActiveAlertsSummary(greenHouseId);
    return result;
  }
}
