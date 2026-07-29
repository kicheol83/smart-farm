import {
  ObjectType,
  InputType,
  Field,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export enum SensorsType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  PH = 'PH',
  LIGHT = 'LIGHT',
  CO2 = 'CO2',
  SOIL_MOISTURE = 'SOIL_MOISTURE',
  WATER_LEVEL = 'WATER_LEVEL',
  WATER_EC = 'WATER_EC',
  RAIN = 'RAIN',
}

registerEnumType(SensorsType, {
  name: 'SensorsType',
  description: 'Sensor turlari',
  valuesMap: {
    TEMPERATURE: { description: 'Harorat (°C)' },
    HUMIDITY: { description: 'Namlik (%)' },
    PH: { description: 'pH qiymati' },
    LIGHT: { description: "Yorug'lik (lux)" },
    CO2: { description: 'CO2 (ppm)' },
    SOIL_MOISTURE: { description: 'Tuproq namligi (%)' },
    WATER_LEVEL: { description: 'Suv tanki darajasi (%)' },
    WATER_EC: {
      description: "Suv elektr o'tkazuvchanligi / TDS (ppm yoki µS/cm)",
    },
    RAIN: { description: "Yomg'ir/tomchi aniqlash (0-100%, 0=quruq)" },
  },
});

@ObjectType()
export class Sensor {
  @Field(() => ID)
  _id: string;

  @Field(() => SensorsType)
  sensorType: SensorsType;

  @Field()
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
  @IsEnum(SensorsType)
  sensorType: SensorsType;

  @Field()
  @IsString()
  @IsNotEmpty()
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
