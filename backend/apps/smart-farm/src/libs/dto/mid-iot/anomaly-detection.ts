import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';

export enum AnomalySeverity {
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

registerEnumType(AnomalySeverity, {
  name: 'AnomalySeverity',
  valuesMap: {
    WARNING: { description: "Z-Score 2-3 — g'ayritabiiy" },
    CRITICAL: { description: "Z-Score > 3 — juda g'ayritabiiy" },
  },
});

@ObjectType()
export class AnomalyDetectionResult {
  @Field()
  isAnomaly: boolean;

  @Field(() => Float)
  zScore: number;

  @Field(() => AnomalySeverity, { nullable: true })
  severity?: AnomalySeverity;

  @Field(() => Float)
  mean: number;

  @Field(() => Float)
  std: number;
}

@ObjectType()
export class AnomalyLog {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  sensorId: string;

  @Field()
  sensorType: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  zScore: number;

  @Field(() => Float)
  meanValue: number;

  @Field(() => AnomalySeverity)
  severity: AnomalySeverity;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field()
  detectedAt: Date;
}
