import {
  ObjectType,
  InputType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SectorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PLANNING = 'PLANNING',
}

export enum NdviLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

registerEnumType(SectorStatus, {
  name: 'SectorStatus',
  valuesMap: {
    ACTIVE: { description: 'Faol sector' },
    INACTIVE: { description: 'Faol emas' },
    PLANNING: { description: 'Rejalashtirilmoqda' },
  },
});

registerEnumType(NdviLevel, {
  name: 'NdviLevel',
  description: "NDVI darajasi — o'simlik sog'ligi ko'rsatkichi",
  valuesMap: {
    VERY_LOW: { description: '0.0 - 0.2 (qizil) — juda past' },
    LOW: { description: '0.2 - 0.4 (sariq) — past' },
    MODERATE: { description: "0.4 - 0.6 (och yashil) — o'rtacha" },
    HIGH: { description: '0.6 - 0.8 (yashil) — yuqori' },
    VERY_HIGH: { description: "0.8 - 1.0 (to'q yashil) — juda yuqori" },
  },
});

@ObjectType()
export class Coordinate {
  @Field(() => Float, { description: 'Kenglik (latitude)' })
  lat: number;

  @Field(() => Float, { description: 'Uzunlik (longitude)' })
  lng: number;
}

@InputType()
export class CoordinateInput {
  @Field(() => Float)
  @IsNumber()
  lat: number;

  @Field(() => Float)
  @IsNumber()
  lng: number;
}

@ObjectType()
export class MapSector {
  @Field(() => ID)
  _id: string;

  @Field()
  sectorName: string;

  @Field(() => SectorStatus)
  sectorStatus: SectorStatus;

  @Field(() => Float)
  sectorArea: number;

  @Field(() => [Coordinate])
  coordinates: Coordinate[];

  @Field(() => Coordinate)
  centerPoint: Coordinate;

  @Field(() => Float, { nullable: true })
  ndviValue?: number;

  @Field(() => NdviLevel, { nullable: true })
  ndviLevel?: NdviLevel;

  @Field(() => Float, { nullable: true })
  healthIndex?: number;

  @Field(() => ID)
  fieldId: string;

  @Field(() => ID, { nullable: true })
  cropsId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class FieldMap {
  @Field(() => ID)
  _id: string;

  @Field()
  fieldName: string;

  @Field({
    nullable: true,
  })
  locationName?: string;

  @Field(() => Float)
  totalArea: number;

  @Field(() => [Coordinate])
  boundaryCoordinates: Coordinate[];

  @Field(() => Coordinate)
  centerPoint: Coordinate;

  @Field(() => [MapSector])
  sectors: MapSector[];

  @Field(() => ID)
  farmId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class FieldAnalyticsPoint {
  @Field()
  date: Date;

  @Field(() => Float, { nullable: true })
  ndviValue?: number;

  @Field(() => Float, { nullable: true })
  healthIndex?: number;

  @Field(() => Float, { nullable: true })
  soilMoisture?: number;
}

@ObjectType()
export class FieldMapAnalytics {
  @Field(() => ID)
  fieldId: string;

  @Field()
  fieldName: string;

  @Field(() => Float)
  avgNdvi: number;

  @Field(() => Float)
  avgHealthIndex: number;

  @Field(() => Int)
  totalSectors: number;

  @Field(() => Int)
  activeSectors: number;

  @Field(() => [FieldAnalyticsPoint], {})
  analyticsHistory: FieldAnalyticsPoint[];
}

@ObjectType()
export class NdviSectorData {
  @Field(() => ID)
  sectorId: string;

  @Field()
  sectorName: string;

  @Field(() => Float)
  ndviValue: number;

  @Field(() => NdviLevel)
  ndviLevel: NdviLevel;

  @Field(() => Coordinate)
  centerPoint: Coordinate;

  @Field(() => [Coordinate])
  coordinates: Coordinate[];

  @Field()
  colorCode: string;
}

@ObjectType()
export class FieldNdviMap {
  @Field(() => ID)
  fieldId: string;

  @Field()
  fieldName: string;

  @Field(() => Float)
  averageNdvi: number;

  @Field()
  lastUpdated: Date;

  @Field(() => [NdviSectorData], {})
  sectors: NdviSectorData[];
}

@InputType()
export class CreateFieldMapInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locationName?: string;

  @Field(() => Float)
  @IsNumber()
  totalArea: number;

  @Field(() => [CoordinateInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(3, { message: 'At least 3 coordinates required for polygon' })
  @Type(() => CoordinateInput)
  boundaryCoordinates: CoordinateInput[];

  @Field(() => CoordinateInput)
  @ValidateNested()
  @Type(() => CoordinateInput)
  centerPoint: CoordinateInput;

  @Field(() => ID)
  @IsMongoId()
  farmId: string;
}

@InputType()
export class UpdateFieldMapInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fieldName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locationName?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalArea?: number;

  @Field(() => [CoordinateInput], { nullable: true })
  @IsOptional()
  @IsArray()
  boundaryCoordinates?: CoordinateInput[];
}

@InputType()
export class CreateSectorInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'sectorName is required' })
  sectorName: string;

  @Field(() => Float)
  @IsNumber()
  sectorArea: number;

  @Field(() => [CoordinateInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(3)
  @Type(() => CoordinateInput)
  coordinates: CoordinateInput[];

  @Field(() => CoordinateInput)
  @ValidateNested()
  @Type(() => CoordinateInput)
  centerPoint: CoordinateInput;

  @Field(() => ID)
  @IsMongoId()
  fieldId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  cropsId?: string;
}

@InputType()
export class UpdateSectorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sectorName?: string;

  @Field(() => SectorStatus, { nullable: true })
  @IsOptional()
  @IsEnum(SectorStatus)
  sectorStatus?: SectorStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  sectorArea?: number;

  @Field(() => [CoordinateInput], { nullable: true })
  @IsOptional()
  @IsArray()
  coordinates?: CoordinateInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  cropsId?: string;
}

@InputType()
export class UpdateNdviInput {
  @Field(() => ID)
  @IsMongoId()
  sectorId: string;

  @Field(() => Float)
  @IsNumber()
  ndviValue: number;
}
