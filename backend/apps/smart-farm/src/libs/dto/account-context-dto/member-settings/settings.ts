import {
  ObjectType,
  InputType,
  Field,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';

export enum TemperatureUnit {
  CELSIUS = 'CELSIUS',
  FAHRENHEIT = 'FAHRENHEIT',
}

export enum AreaUnit {
  SQUARE_METER = 'SQUARE_METER',
  SQUARE_FEET = 'SQUARE_FEET',
  HECTARE = 'HECTARE',
  ACRE = 'ACRE',
}

export enum WaterUnit {
  LITER = 'LITER',
  GALLON = 'GALLON',
}

export enum Language {
  EN = 'EN',
  UZ = 'UZ',
  RU = 'RU',
  KO = 'KR',
}

export enum TimeFormat {
  FORMAT_12H = 'FORMAT_12H',
  FORMAT_24H = 'FORMAT_24H',
}

registerEnumType(TemperatureUnit, {
  name: 'TemperatureUnit',
  valuesMap: {
    CELSIUS: { description: 'Celsius (°C)' },
    FAHRENHEIT: { description: 'Fahrenheit (°F)' },
  },
});

registerEnumType(AreaUnit, {
  name: 'AreaUnit',
  valuesMap: {
    SQUARE_METER: { description: 'Kvadrat metr (m²)' },
    SQUARE_FEET: { description: 'Kvadrat fut (ft²)' },
    HECTARE: { description: 'Gektar (ha)' },
    ACRE: { description: 'Akr (ac)' },
  },
});

registerEnumType(WaterUnit, {
  name: 'WaterUnit',
  valuesMap: {
    LITER: { description: 'Litr (L)' },
    GALLON: { description: 'Gallon (gal)' },
  },
});

registerEnumType(Language, {
  name: 'Language',
  valuesMap: {
    EN: { description: 'English' },
    UZ: { description: "O'zbekcha" },
    RU: { description: 'Русский' },
    KO: { description: '한국어' },
  },
});

registerEnumType(TimeFormat, {
  name: 'TimeFormat',
  valuesMap: {
    FORMAT_12H: { description: '12 soatlik (AM/PM)' },
    FORMAT_24H: { description: '24 soatlik' },
  },
});

@ObjectType()
export class UnitSettings {
  @Field(() => TemperatureUnit)
  temperatureUnit: TemperatureUnit;

  @Field(() => AreaUnit)
  areaUnit: AreaUnit;

  @Field(() => WaterUnit)
  waterUnit: WaterUnit;

  @Field(() => TimeFormat)
  timeFormat: TimeFormat;
}

@ObjectType()
export class GeneralSettings {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => Language)
  language: Language;

  @Field(() => UnitSettings)
  units: UnitSettings;

  @Field({ description: 'Timezone: Asia/Tashkent, UTC...' })
  timezone: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class UpdateUnitSettingsInput {
  @Field(() => TemperatureUnit, { nullable: true })
  @IsOptional()
  @IsEnum(TemperatureUnit)
  temperatureUnit?: TemperatureUnit;

  @Field(() => AreaUnit, { nullable: true })
  @IsOptional()
  @IsEnum(AreaUnit)
  areaUnit?: AreaUnit;

  @Field(() => WaterUnit, { nullable: true })
  @IsOptional()
  @IsEnum(WaterUnit)
  waterUnit?: WaterUnit;

  @Field(() => TimeFormat, { nullable: true })
  @IsOptional()
  @IsEnum(TimeFormat)
  timeFormat?: TimeFormat;
}

@InputType()
export class UpdateGeneralSettingsInput {
  @Field(() => Language, { nullable: true })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field(() => UpdateUnitSettingsInput, { nullable: true })
  @IsOptional()
  units?: UpdateUnitSettingsInput;
}
