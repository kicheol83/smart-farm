import {
  ObjectType,
  InputType,
  Field,
  ID,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export enum ActionResource {
  MEMBER = 'MEMBER',
  FARM = 'FARM',
  GREENHOUSE = 'GREENHOUSE',
  DEVICE = 'DEVICE',
  SENSOR = 'SENSOR',
  TASK = 'TASK',
  REPORT = 'REPORT',
  SETTINGS = 'SETTINGS',
  CAMERA = 'CAMERA',
  ALERT = 'ALERT',
}

registerEnumType(ActionType, {
  name: 'ActionType',
  valuesMap: {
    CREATE: { description: 'Yaratish' },
    UPDATE: { description: 'Yangilash' },
    DELETE: { description: "O'chirish" },
    LOGIN: { description: 'Tizimga kirish' },
    LOGOUT: { description: 'Tizimdan chiqish' },
    EXPORT: { description: 'Export qilish' },
    IMPORT: { description: 'Import qilish' },
  },
});

registerEnumType(ActionResource, {
  name: 'ActionResource',
});

@ObjectType()
export class ActionLog {
  @Field(() => ID)
  _id: string;

  @Field(() => ActionType)
  actionType: ActionType;

  @Field(() => ActionResource)
  actionResource: ActionResource;

  @Field()
  description: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  memberFullName: string;

  @Field({
    nullable: true,
  })
  device?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  actionCode?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaginatedActionLogs {
  @Field(() => [ActionLog])
  items: ActionLog[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@InputType()
export class GetActionLogsInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field(() => ActionType, { nullable: true })
  @IsOptional()
  @IsEnum(ActionType)
  actionType?: ActionType;

  @Field(() => ActionResource, { nullable: true })
  @IsOptional()
  @IsEnum(ActionResource)
  actionResource?: ActionResource;

  @Field()
  @IsOptional()
  @IsDateString()
  from?: string;

  @Field()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export interface CreateActionLogData {
  actionType: ActionType;
  actionResource: ActionResource;
  description: string;
  resourceId?: string;
  memberId: string;
  memberFullName: string;
  device?: string;
  ipAddress?: string;
  actionCode?: string;
}
