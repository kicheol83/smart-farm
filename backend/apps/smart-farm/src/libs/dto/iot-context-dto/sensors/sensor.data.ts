import { ObjectType, InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

@ObjectType()
export class SensorData {
  @Field(() => ID)
  _id: string;

  @Field()
  sensorDataName: string;

  @Field(() => Float)
  sensorDataValue: number;

  @Field()
  recordedAt: Date;

  @Field(() => ID)
  sensorId: string;
}

@ObjectType()
export class GreenhouseSensorSummary {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  greenHouseName: string;

  @Field(() => Float)
  temperature?: number;

  @Field(() => Float)
  humidity?: number;

  @Field(() => Float)
  ph?: number;

  @Field(() => Float)
  light?: number;

  @Field(() => Float)
  co2?: number;

  @Field(() => Float)
  soilMoisture?: number;

  @Field()
  lastUpdated: Date;
}

@ObjectType()
export class TodayTemperatureRange {
  @Field(() => Float, {
    nullable: true,
  })
  high?: number;

  @Field(() => Float, {
    nullable: true,
  })
  low?: number;
}

@InputType()
export class CreateSensorDataInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  sensorDataName: string;

  @Field(() => Float)
  @IsNumber()
  sensorDataValue: number;

  @Field()
  @IsDateString()
  recordedAt: string;

  @Field(() => ID)
  @IsMongoId()
  sensorId: string;
}

@InputType()
export class IotSensorDataInput extends CreateSensorDataInput {
  @Field(() => ID, { description: 'Real-time broadcast uchun greenhouse ID' })
  @IsMongoId()
  greenHouseId: string;
}
