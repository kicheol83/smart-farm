import {
  ObjectType,
  InputType,
  Field,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { Schema } from 'mongoose';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export enum CommandType {
  RESTART = 'RESTART',
  CALIBRATE = 'CALIBRATE',
  SET_INTERVAL = 'SET_INTERVAL',
  ENABLE_SENSOR = 'ENABLE_SENSOR',
  DISABLE_SENSOR = 'DISABLE_SENSOR',
  TAKE_SNAPSHOT = 'TAKE_SNAPSHOT',
  UPDATE_FIRMWARE = 'UPDATE_FIRMWARE',
}

export enum CommandStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
}

registerEnumType(CommandType, {
  name: 'CommandType',
  valuesMap: {
    RESTART: { description: 'Qurilmani qayta yuklash' },
    CALIBRATE: { description: 'Sensori kalibrovka qilish' },
    SET_INTERVAL: { description: "Ma'lumot yuborish intervali (soniya)" },
    ENABLE_SENSOR: { description: 'Sensori yoqish' },
    DISABLE_SENSOR: { description: "Sensori o'chirish" },
    TAKE_SNAPSHOT: { description: 'Kamera snapshot olish' },
    UPDATE_FIRMWARE: { description: 'Firmware yangilash' },
  },
});

registerEnumType(CommandStatus, {
  name: 'CommandStatus',
  valuesMap: {
    PENDING: { description: 'Yuborilmagan' },
    SENT: { description: 'Yuborildi (MQTT orqali)' },
    RECEIVED: { description: 'Qurilma qabul qildi' },
    EXECUTED: { description: 'Bajarildi' },
    FAILED: { description: 'Xatolik' },
  },
});

@ObjectType()
export class DeviceCommand {
  @Field(() => ID)
  _id: string;

  @Field(() => CommandType)
  commandType: CommandType;

  @Field(() => CommandStatus)
  commandStatus: CommandStatus;

  @Field({ nullable: true })
  payload?: string;

  @Field(() => ID)
  deviceId: string;

  @Field(() => ID)
  sentByMemberId: string;

  @Field({nullable: true})
  response?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  executedAt?: Date;
}

@InputType()
export class SendCommandInput {
  @Field(() => ID)
  @IsMongoId()
  deviceId: string;

  @Field(() => CommandType)
  @IsEnum(CommandType)
  commandType: CommandType;

  @Field({ nullable: true })
  @IsOptional()
  payload?: string;
}

export const DeviceCommandSchema = new Schema(
  {
    commandType: {
      type: String,
      enum: Object.values(CommandType),
      required: true,
    },
    commandStatus: {
      type: String,
      enum: Object.values(CommandStatus),
      default: CommandStatus.PENDING,
    },
    payload: { type: String, default: null },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'devices',
      required: true,
    },
    sentByMemberId: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: true,
    },
    response: { type: String, default: null },
    executedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'deviceCommands' },
);

DeviceCommandSchema.index({ deviceId: 1 });
DeviceCommandSchema.index({ commandStatus: 1 });
DeviceCommandSchema.index({ createdAt: -1 });
