import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';

export enum TimeSeriesGranularity {
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
}

registerEnumType(TimeSeriesGranularity, {
  name: 'TimeSeriesGranularity',
  valuesMap: {
    MINUTE: { description: "Minutlik o'rtacha" },
    HOUR: { description: "Soatlik o'rtacha" },
    DAY: { description: "Kunlik o'rtacha" },
  },
});

@ObjectType()
export class TimeSeriesDataPoint {
  @Field()
  timestamp: Date;

  @Field(() => Float)
  value: number;

  @Field(() => Float, { nullable: true })
  avgValue?: number;

  @Field(() => Float, { nullable: true })
  minValue?: number;

  @Field(() => Float, { nullable: true })
  maxValue?: number;
}
