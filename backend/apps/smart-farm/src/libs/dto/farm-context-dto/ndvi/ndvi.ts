import {
  ObjectType,
  InputType,
  Field,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsMongoId,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export enum NdviRecordType {
  DRONE = 'DRONE',
  MANUAL = 'MANUAL',
  SENSOR = 'SENSOR',
}

registerEnumType(NdviRecordType, {
  name: 'NdviRecordType',
  valuesMap: {
    DRONE: { description: 'Drone orqali olingan' },
    MANUAL: { description: "Qo'lda kiritilgan" },
    SENSOR: { description: 'Sensor orqali' },
  },
});

@ObjectType()
export class NdviRecord {
  @Field(() => ID)
  _id: string;

  @Field(() => Float, { description: 'NDVI qiymati 0.0 - 1.0' })
  ndviValue: number;

  @Field(() => Float, { nullable: true, description: "Sog'lik indeksi 0-100" })
  healthIndex?: number;

  @Field(() => Float, { nullable: true, description: 'Tuproq namligi %' })
  soilMoisture?: number;

  @Field({ description: 'Yozilgan vaqt' })
  recordedAt: Date;

  @Field(() => ID)
  sectorId: string;

  @Field(() => ID)
  fieldId: string;
}

@ObjectType()
export class NdviTrendPoint {
  @Field()
  date: Date;

  @Field(() => Float)
  ndviValue: number;

  @Field(() => Float, { nullable: true })
  healthIndex?: number;
}

@ObjectType()
export class SectorNdviTrend {
  @Field(() => ID)
  sectorId: string;

  @Field()
  sectorName: string;

  @Field(() => Float, { description: 'Hozirgi NDVI' })
  currentNdvi: number;

  @Field(() => Float, { description: "O'rtacha NDVI" })
  averageNdvi: number;

  @Field(() => Float, { description: "O'zgarish %" })
  changePercent: number;

  @Field(() => [NdviTrendPoint])
  trend: NdviTrendPoint[];
}

@InputType()
export class RecordNdviInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0, { message: 'ndviValue min 0.0' })
  @Max(1, { message: 'ndviValue max 1.0' })
  ndviValue: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  healthIndex?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  soilMoisture?: number;

  @Field()
  @IsDateString()
  recordedAt: string;

  @Field(() => ID)
  @IsMongoId()
  sectorId: string;

  @Field(() => ID)
  @IsMongoId()
  fieldId: string;
}
