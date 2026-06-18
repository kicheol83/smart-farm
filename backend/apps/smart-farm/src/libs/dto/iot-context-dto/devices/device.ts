import {
  ObjectType,
  InputType,
  Field,
  ID,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export enum DeviceType {
  SENSOR_HUB = 'SENSOR_HUB',
  CONTROLLER = 'CONTROLLER',
  CAMERA = 'CAMERA',
  GATEWAY = 'GATEWAY',
  WEATHER_STATION = 'WEATHER_STATION',
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
}

registerEnumType(DeviceType, {
  name: 'DeviceType',
  valuesMap: {
    SENSOR_HUB: { description: 'Sensor hub qurilma' },
    CONTROLLER: { description: 'Nazorat qurilma' },
    CAMERA: { description: 'Kamera qurilma' },
    GATEWAY: { description: 'Gateway qurilma' },
    WEATHER_STATION: { description: 'Ob-havo stansiyasi' },
  },
});

registerEnumType(DeviceStatus, {
  name: 'DeviceStatus',
  valuesMap: {
    ONLINE: { description: 'Ishlayapti' },
    OFFLINE: { description: "O'chirilgan" },
    MAINTENANCE: { description: 'Texnik xizmat' },
    ERROR: { description: 'Xatolik' },
  },
});

@ObjectType()
export class Device {
  @Field(() => ID)
  _id: string;

  @Field()
  deviceName: string;

  @Field(() => DeviceType)
  deviceType: DeviceType;

  @Field(() => DeviceStatus)
  deviceStatus: DeviceStatus;

  @Field()
  installedAt: Date;

  @Field(() => ID)
  greenHouseId: string;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class DeviceStatusCount {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  online: number;

  @Field(() => Int)
  offline: number;

  @Field(() => Int)
  maintenance: number;

  @Field(() => Int)
  error: number;
}

@ObjectType()
export class DeviceTypeCount {
  @Field(() => DeviceType)
  deviceType: DeviceType;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class GreenhouseDeviceOverview {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  greenHouseName: string;

  @Field(() => DeviceStatusCount)
  statusCounts: DeviceStatusCount;

  @Field(() => [DeviceTypeCount])
  typeCounts: DeviceTypeCount[];

  @Field(() => [Device])
  devices: Device[];
}

@ObjectType()
export class SensorInfo {
  @Field(() => ID)
  _id: string;

  @Field()
  sensorType: string;

  @Field()
  sensorsUnit: string;
}

@ObjectType()
export class DeviceWithSensors {
  @Field(() => ID)
  _id: string;

  @Field()
  deviceName: string;

  @Field(() => DeviceType)
  deviceType: DeviceType;

  @Field(() => DeviceStatus)
  deviceStatus: DeviceStatus;

  @Field()
  installedAt: Date;

  @Field(() => ID)
  greenHouseId: string;

  @Field(() => [SensorInfo])
  sensors: SensorInfo[];

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateDeviceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @Field(() => DeviceType)
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @Field()
  @IsDateString({ strict: true })
  installedAt: string;

  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;
}

@InputType()
export class UpdateDeviceInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @Field(() => DeviceType, { nullable: true })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @Field(() => DeviceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DeviceStatus)
  deviceStatus?: DeviceStatus;
}

@InputType()
export class FilterDevicesInput {
  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field(() => DeviceType, { nullable: true })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @Field(() => DeviceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DeviceStatus)
  deviceStatus?: DeviceStatus;
}
