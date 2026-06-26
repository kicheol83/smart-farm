import {
  ObjectType,
  InputType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export enum AlertsActualValues {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

registerEnumType(AlertsActualValues, {
  name: 'AlertsActualValues',
  valuesMap: {
    LOW: { description: 'Past qiymat' },
    NORMAL: { description: 'Normal qiymat' },
    HIGH: { description: 'Yuqori qiymat' },
  },
});

registerEnumType(AlertSeverity, {
  name: 'AlertSeverity',
  valuesMap: {
    INFO: { description: "Ma'lumot" },
    WARNING: { description: 'Ogohlantirish' },
    CRITICAL: { description: 'Kritik' },
  },
});

@ObjectType()
export class Alert {
  @Field(() => ID)
  _id: string;

  @Field()
  alertsType: string;

  @Field(() => Float)
  alertsThreshold: number;

  @Field(() => AlertsActualValues)
  alertsActualValues: AlertsActualValues;

  @Field(() => AlertSeverity)
  alertsSeverity: AlertSeverity;

  @Field(() => ID)
  sensorsId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AlertNotification {
  @Field(() => ID)
  _id: string;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field(() => ID)
  memberId: string;

  @Field(() => ID)
  alertsId: string;

  @Field(() => Alert, { nullable: true })
  alert?: Alert;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedAlertNotifications {
  @Field(() => [AlertNotification])
  items: AlertNotification[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  unreadCount: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class ActiveAlertsSummary {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  critical: number;

  @Field(() => Int)
  warning: number;

  @Field(() => Int)
  info: number;

  @Field(() => [Alert])
  recentAlerts: Alert[];
}

@InputType()
export class CreateAlertInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  alertsType: string;

  @Field(() => Float)
  @IsNumber()
  alertsThreshold: number;

  @Field(() => AlertsActualValues)
  @IsEnum(AlertsActualValues)
  alertsActualValues: AlertsActualValues;

  @Field(() => AlertSeverity)
  @IsEnum(AlertSeverity)
  alertsSeverity: AlertSeverity;

  @Field(() => ID)
  @IsMongoId()
  sensorsId: string;
}

@InputType()
export class GetAlertNotificationsInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field({ nullable: true })
  @IsOptional()
  unreadOnly?: boolean;

  @Field(() => AlertSeverity, { nullable: true })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;
}

@InputType()
export class CheckSensorThresholdInput {
  @Field(() => ID)
  @IsMongoId()
  sensorsId: string;

  @Field(() => Float)
  @IsNumber()
  currentValue: number;
}
