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

  @Field(() => Float, { nullable: true, description: '°C' })
  temperature?: number;

  @Field(() => Float, { nullable: true, description: '%' })
  humidity?: number;

  @Field(() => Float, { nullable: true, description: 'pH' })
  ph?: number;

  @Field(() => Float, { nullable: true, description: 'light (lux)' })
  light?: number;

  @Field(() => Float, { nullable: true, description: 'CO2 (ppm)' })
  co2?: number;

  @Field(() => Float, { nullable: true, description: 'Soil Moisture (%)' })
  soilMoisture?: number;

  @Field()
  lastUpdated: Date;
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

// IoT qurilma WebSocket orqali bulk yuboradi
@InputType()
export class IotSensorDataInput extends CreateSensorDataInput {
  @Field(() => ID, { description: 'Real-time broadcast uchun greenhouse ID' })
  @IsMongoId()
  greenHouseId: string;
}
