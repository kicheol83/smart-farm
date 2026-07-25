import { ObjectType, InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

@ObjectType()
export class AlertThresholds {
  @Field(() => Float)
  maxTemperature: number;

  @Field(() => Float)
  minTemperature: number;

  @Field(() => Float)
  minHumidity: number;

  @Field(() => Float)
  maxHumidity: number;

  @Field(() => Float)
  minPh: number;

  @Field(() => Float)
  maxPh: number;

  @Field(() => Float)
  minSoilMoisture: number;
}

@ObjectType()
export class NotificationChannels {
  @Field()
  email: boolean;

  @Field()
  push: boolean;

  @Field()
  inApp: boolean;
}

@ObjectType()
export class NotificationSettings {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  enabled: boolean;

  @Field(() => NotificationChannels)
  channels: NotificationChannels;

  @Field(() => AlertThresholds)
  alertThresholds: AlertThresholds;

  @Field()
  criticalAlerts: boolean;

  @Field()
  warningAlerts: boolean;

  @Field()
  infoAlerts: boolean;

  @Field()
  deviceOfflineAlerts: boolean;

  @Field()
  reportReadyAlerts: boolean;

  @Field({
    nullable: true,
  })
  floatingNotifications?: boolean;

  @Field({ nullable: true })
  lockScreenNotifications?: boolean;

  @Field({ nullable: true, })
  notificationsManagement?: boolean;

  @Field(() => Float, {
    nullable: true,
  })
  triggerEveryNMessages?: number;

  @Field(() => Float, {
    nullable: true,
  })
  sendOncePerDays?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class UpdateNotificationChannelsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;
}

@InputType()
export class UpdateAlertThresholdsInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxTemperature?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minTemperature?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minHumidity?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxHumidity?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  minPh?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  maxPh?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minSoilMoisture?: number;
}

@InputType()
export class UpdateNotificationSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @Field(() => UpdateNotificationChannelsInput, { nullable: true })
  @IsOptional()
  channels?: UpdateNotificationChannelsInput;

  @Field(() => UpdateAlertThresholdsInput, { nullable: true })
  @IsOptional()
  alertThresholds?: UpdateAlertThresholdsInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  criticalAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  warningAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  infoAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  deviceOfflineAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  reportReadyAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  floatingNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  lockScreenNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notificationsManagement?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  triggerEveryNMessages?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  sendOncePerDays?: number;
}
