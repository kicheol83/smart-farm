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

  @Field(() => Float, { nullable: true })
  temperature?: number;

  @Field(() => Float, { nullable: true })
  humidity?: number;

  @Field(() => Float, { nullable: true })
  ph?: number;

  @Field(() => Float, { nullable: true })
  light?: number;

  @Field(() => Float, {
    nullable: true,
  })
  co2?: number;

  @Field(() => Float, { nullable: true })
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
  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;
}
