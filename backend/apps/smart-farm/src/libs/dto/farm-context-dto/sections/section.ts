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
  IsPositive,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export enum SectionStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  INACTIVE = 'INACTIVE',
}

export enum SectionType {
  HYDROPONIC = 'HYDROPONIC',
  SOIL = 'SOIL',
  AEROPONIC = 'AEROPONIC',
  NFT = 'NFT',
}

registerEnumType(SectionStatus, {
  name: 'SectionStatus',
  valuesMap: {
    HEALTHY: { description: "O'simliklar sog'lom" },
    WARNING: { description: 'Diqqat talab qiladi' },
    CRITICAL: { description: 'Kritik holat' },
    INACTIVE: { description: 'Faol emas' },
  },
});

registerEnumType(SectionType, {
  name: 'SectionType',
  valuesMap: {
    HYDROPONIC: { description: 'Gidroponik' },
    SOIL: { description: 'Tuproqli' },
    AEROPONIC: { description: 'Aeroponik' },
    NFT: { description: 'Nutrient Film Technique' },
  },
});

@ObjectType()
export class Section {
  @Field(() => ID)
  _id: string;

  @Field()
  sectionName: string;

  @Field(() => SectionType)
  sectionType: SectionType;

  @Field(() => SectionStatus)
  sectionStatus: SectionStatus;

  @Field(() => Float)
  sectionArea: number;

  @Field(() => Int)
  plantCount: number;

  @Field(() => Float, {
    nullable: true,
  })
  currentHealthIndex?: number;

  @Field(() => ID)
  greenHouseId: string;

  @Field(() => ID, { nullable: true })
  cropsId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SectionHealthSummary {
  @Field(() => ID)
  sectionId: string;

  @Field()
  sectionName: string;

  @Field(() => SectionStatus)
  sectionStatus: SectionStatus;

  @Field(() => Float)
  healthIndex: number;

  @Field(() => Float, { nullable: true })
  temperature?: number;

  @Field(() => Float, { nullable: true })
  humidity?: number;

  @Field(() => Float, { nullable: true })
  soilMoisture?: number;

  @Field(() => Float, { nullable: true })
  ph?: number;

  @Field({ description: 'Oxirgi yangilanish' })
  lastUpdated: Date;
}

@ObjectType()
export class GreenhouseSectionOverview {
  @Field(() => ID)
  greenHouseId: string;

  @Field()
  greenHouseName: string;

  @Field(() => Int)
  totalSections: number;

  @Field(() => Int)
  healthySections: number;

  @Field(() => Int)
  warningSections: number;

  @Field(() => Int)
  criticalSections: number;

  @Field(() => Float)
  overallHealthIndex: number;

  @Field(() => [SectionHealthSummary], {})
  sections: SectionHealthSummary[];
}

@InputType()
export class CreateSectionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  sectionName: string;

  @Field(() => SectionType)
  @IsEnum(SectionType)
  sectionType: SectionType;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  sectionArea: number;

  @Field(() => Int)
  @IsNumber()
  @IsPositive()
  plantCount: number;

  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  cropsId?: string;
}

@InputType()
export class UpdateSectionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sectionName?: string;

  @Field(() => SectionType, { nullable: true })
  @IsOptional()
  @IsEnum(SectionType)
  sectionType?: SectionType;

  @Field(() => SectionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(SectionStatus)
  sectionStatus?: SectionStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  sectionArea?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  plantCount?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  cropsId?: string;
}

@InputType()
export class UpdateSectionHealthInput {
  @Field(() => ID)
  @IsMongoId()
  sectionId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  healthIndex: number;
}
