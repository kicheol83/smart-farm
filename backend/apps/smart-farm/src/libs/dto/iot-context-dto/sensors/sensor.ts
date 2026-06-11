import {
  ObjectType,
  InputType,
  Field,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { SensorsType } from '../../../enums/sensors.enum';

@ObjectType()
export class Sensor {
  @Field(() => ID)
  _id: string;

  @Field(() => SensorsType)
  sensorType: SensorsType;

  @Field({ description: ' => °C, %, pH, lux, ppm' })
  sensorsUnit: string;

  @Field(() => ID)
  deviceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateSensorInput {
  @Field(() => SensorsType)
  @IsEnum(SensorsType, { message: 'Invalid sensor type' })
  sensorType: SensorsType;

  @Field({ description: ' => °C, %, pH, lux, ppm' })
  @IsString()
  @IsNotEmpty({ message: 'sensorsUnit is required' })
  sensorsUnit: string;

  @Field(() => ID)
  @IsMongoId()
  deviceId: string;
}

@InputType()
export class UpdateSensorInput {
  @Field(() => SensorsType, { nullable: true })
  @IsEnum(SensorsType)
  sensorType?: SensorsType;

  @Field({ nullable: true })
  @IsString()
  sensorsUnit?: string;
}
