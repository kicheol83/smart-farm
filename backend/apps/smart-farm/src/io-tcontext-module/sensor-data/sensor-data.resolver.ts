import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  CreateSensorDataInput,
  GreenhouseSensorSummary,
  SensorData,
  TodayTemperatureRange,
} from '../../libs/dto/iot-context-dto/sensors/sensor.data';

@Resolver()
export class SensorDataResolver {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Mutation(() => SensorData)
  @UseGuards(AuthGuard)
  public async recordSensorData(
    @Args('input') input: CreateSensorDataInput,
  ): Promise<SensorData> {
    console.log('Mutation: recordSensorData');
    const result = await this.sensorDataService.create(input);
    return result as any;
  }

  @Query(() => [SensorData])
  @UseGuards(AuthGuard)
  public async sensorReadings(
    @Args('sensorId', { type: () => ID }) sensorId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<SensorData[]> {
    console.log('Query: sensorReadings');
    const result = await this.sensorDataService.findBySensor(sensorId, limit);
    return result as any;
  }

  @Query(() => GreenhouseSensorSummary)
  @UseGuards(AuthGuard)
  public async greenhouseSensorSummary(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<GreenhouseSensorSummary> {
    console.log('Query: greenhouseSensorSummary');
    const result =
      await this.sensorDataService.getGreenhouseSummary(greenHouseId);
    return result;
  }

  @Query(() => [SensorData], { description: 'Grafik uchun sensor tarixi' })
  @UseGuards(AuthGuard)
  public async sensorHistory(
    @Args('sensorId', { type: () => ID }) sensorId: string,
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<SensorData[]> {
    console.log('Query: sensorHistory');
    const result = await this.sensorDataService.getHistory(
      sensorId,
      new Date(from),
      new Date(to),
    );
    return result as any;
  }

  @Query(() => TodayTemperatureRange)
  @UseGuards(AuthGuard)
  async todayTemperatureRange(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<TodayTemperatureRange> {
    return this.sensorDataService.getTodayTemperatureRange(greenHouseId);
  }
}
