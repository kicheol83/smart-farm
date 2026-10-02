import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CurrentWeather {
  @Field(() => Float)
  temperature: number;

  @Field(() => Float)
  humidity: number;

  @Field(() => Float)
  windSpeed: number;

  @Field(() => Int)
  windDirection: number;

  @Field(() => Float)
  precipitation: number;

  @Field()
  condition: string;

  @Field(() => Int)
  weatherCode: number;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  observedAt: Date;

  @Field()
  source: string;
}
