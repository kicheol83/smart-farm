import {
  ObjectType,
  InputType,
  Field,
  ID,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { MemberRole, MemberStatus } from '../../../libs/enums/member.enum';

// Re-export for resolver convenience
export { MemberRole, MemberStatus };

@ObjectType()
export class GlobalStats {
  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  activeMembers: number;

  @Field(() => Int)
  inactiveMembers: number;

  @Field(() => Int)
  totalFarms: number;

  @Field(() => Int)
  totalGreenhouses: number;

  @Field(() => Int)
  totalDevices: number;

  @Field(() => Int)
  onlineDevices: number;

  @Field(() => Int)
  offlineDevices: number;

  @Field(() => Int)
  totalSensors: number;

  @Field(() => Int)
  alertsLast24h: number;

  @Field(() => Int)
  criticalAlertsCount: number;

  @Field(() => Int)
  totalTasks: number;

  @Field(() => Int)
  completedTasks: number;

  @Field(() => Int)
  overdueTasks: number;
}

@ObjectType()
export class GrowthDataPoint {
  @Field()
  date: Date;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class MemberGrowthTrend {
  @Field(() => Int)
  newRegistrations: number;

  @Field(() => Float)
  growthPercent: number;

  @Field(() => [GrowthDataPoint])
  dataPoints: GrowthDataPoint[];
}

@ObjectType()
export class AdminMemberView {
  @Field(() => ID)
  _id: string;

  @Field()
  memberFullName: string;

  @Field()
  memberEmail: string;

  @Field(() => MemberRole)
  memberRole: MemberRole;

  @Field(() => MemberStatus)
  memberStatus: MemberStatus;

  @Field({ nullable: true })
  memberAvatar?: string;

  @Field(() => Int)
  farmsCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedAdminMembers {
  @Field(() => [AdminMemberView])
  items: AdminMemberView[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class DeviceHealthOverview {
  @Field(() => ID)
  deviceId: string;

  @Field()
  deviceName: string;

  @Field()
  deviceStatus: string;

  @Field()
  deviceType: string;

  @Field()
  greenHouseName: string;

  @Field()
  farmName: string;

  @Field()
  ownerEmail: string;

  @Field()
  installedAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedDeviceHealth {
  @Field(() => [DeviceHealthOverview])
  items: DeviceHealthOverview[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class SystemAlertOverview {
  @Field(() => ID)
  alertId: string;

  @Field()
  alertsType: string;

  @Field()
  alertsSeverity: string;

  @Field(() => Float)
  alertsThreshold: number;

  @Field()
  ownerEmail: string;

  @Field()
  greenHouseName: string;

  @Field()
  createdAt: Date;
}

@InputType()
export class GetAdminMembersInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field({
    nullable: true,
    description: "memberFullName / memberEmail bo'yicha qidirish",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => MemberRole, { nullable: true })
  @IsOptional()
  @IsEnum(MemberRole)
  memberRole?: MemberRole;

  @Field(() => MemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MemberStatus)
  memberStatus?: MemberStatus;
}

@InputType()
export class UpdateMemberRoleInput {
  @Field(() => ID)
  @IsMongoId()
  memberId: string;

  @Field(() => MemberRole)
  @IsEnum(MemberRole)
  memberRole: MemberRole;
}

@InputType()
export class UpdateMemberStatusInput {
  @Field(() => ID)
  @IsMongoId()
  memberId: string;

  @Field(() => MemberStatus)
  @IsEnum(MemberStatus)
  memberStatus: MemberStatus;
}

@InputType()
export class GetGrowthTrendInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  to?: string;
}

@InputType()
export class GetDeviceHealthInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  deviceStatus?: string;
}
