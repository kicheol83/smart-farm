import {
  ObjectType,
  InputType,
  Field,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export enum CameraStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  RECORDING = 'RECORDING',
}

registerEnumType(CameraStatus, {
  name: 'CameraStatus',
  valuesMap: {
    ONLINE: { description: 'Faol — jonli efir' },
    OFFLINE: { description: "O'chirilgan" },
    RECORDING: { description: 'Yozib olmoqda' },
  },
});

@ObjectType()
export class Camera {
  @Field(() => ID)
  _id: string;

  @Field()
  cameraStreamUrl: string;

  @Field(() => CameraStatus)
  cameraStatus: CameraStatus;

  @Field(() => ID)
  greenHouseId: string;

  @Field({
    nullable: true,
  })
  cameraName?: string;

  @Field({
    nullable: true,
  })
  model?: string;

  @Field({
    nullable: true,
  })
  networkStatus?: string;

  @Field({
    nullable: true,
  })
  resolution?: string;

  @Field({
    nullable: true,
  })
  encoding?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CameraSnapshot {
  @Field(() => ID)
  _id: string;

  @Field({ description: 'S3 snapshot URL' })
  snapshotUrl: string;

  @Field()
  captureAt: Date;

  @Field(() => ID)
  cameraId: string;
}

@InputType()
export class CreateCameraInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  cameraStreamUrl: string;

  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cameraName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  networkStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resolution?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  encoding?: string;
}

@InputType()
export class UpdateCameraInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cameraStreamUrl?: string;

  @Field(() => CameraStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CameraStatus)
  cameraStatus?: CameraStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cameraName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  networkStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resolution?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  encoding?: string;
}

@InputType()
export class CreateSnapshotInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  snapshotUrl: string;

  @Field()
  captureAt: string;

  @Field(() => ID)
  @IsMongoId()
  cameraId: string;
}
