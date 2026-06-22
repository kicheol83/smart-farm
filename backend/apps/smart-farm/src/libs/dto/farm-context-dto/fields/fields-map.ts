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
  VERY_LOW = 'VERY_LOW', // 0.0 - 0.2 (red)
  LOW = 'LOW', // 0.2 - 0.4 (yellow)
  MODERATE = 'MODERATE', // 0.4 - 0.6 (light green)
  HIGH = 'HIGH', // 0.6 - 0.8 (green)
  VERY_HIGH = 'VERY_HIGH', // 0.8 - 1.0 (dark green)
}

registerEnumType(SectorStatus, {
  name: 'SectorStatus',
  valuesMap: {
    ACTIVE: { description: 'Active sector' },
    INACTIVE: { description: 'Inactive sector' },
    PLANNING: { description: 'Sector in planning stage' },
  },
});

registerEnumType(NdviLevel, {
  name: 'NdviLevel',
  description: 'NDVI level - vegetation health indicator',
  valuesMap: {
    VERY_LOW: { description: '0.0 - 0.2 (red) - very low vegetation health' },
    LOW: { description: '0.2 - 0.4 (yellow) - low vegetation health' },
    MODERATE: {
      description: '0.4 - 0.6 (light green) - moderate vegetation health',
    },
    HIGH: { description: '0.6 - 0.8 (green) - high vegetation health' },
    VERY_HIGH: {
      description: '0.8 - 1.0 (dark green) - very high vegetation health',
    },
  },
});

@ObjectType()
export class Coordinate {
  @Field(() => Float)
  lat: number;

  @Field(() => Float)
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

  @Field(() => Float)
  ndviValue?: number;

  @Field(() => NdviLevel, { nullable: true })
  ndviLevel?: NdviLevel;

  @Field(() => Float)
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

  @Field(() => [FieldAnalyticsPoint])
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

  @Field(() => [NdviSectorData])
  sectors: NdviSectorData[];
}

@InputType()
export class CreateFieldMapInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @Field(() => Float)
  @IsNumber()
  totalArea: number;

  @Field(() => [CoordinateInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(3)
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
  @IsNotEmpty()
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
