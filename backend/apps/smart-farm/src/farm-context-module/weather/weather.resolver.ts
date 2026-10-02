import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { CurrentWeather } from '../../libs/dto/farm-context-dto/weather';
import { WeatherService } from './weather.service';

@Resolver()
@UseGuards(AuthGuard)
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  @Query(() => CurrentWeather)
  public async currentWeather(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<CurrentWeather> {
    return this.weatherService.getCurrentWeather(greenHouseId);
  }
}
