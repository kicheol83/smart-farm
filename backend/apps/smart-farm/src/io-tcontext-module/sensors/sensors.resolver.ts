import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreateSensorInput,
  Sensor,
  UpdateSensorInput,
} from '../../libs/dto/iot-context-dto/sensors/sensor';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { SensorsService } from './sensors.service';

@Resolver(() => Sensor)
export class SensorsResolver {
  constructor(private readonly sensorService: SensorsService) {}

  @Mutation(() => Sensor)
  @UseGuards(AuthGuard)
  public async createSensor(
    @Args('input') input: CreateSensorInput,
  ): Promise<Sensor> {
    console.log('Mutation: createSensor');
    const result = await this.sensorService.create(input);
    return result as any;
  }

  @Query(() => [Sensor])
  @UseGuards(AuthGuard)
  public async sensorsByDevice(
    @Args('deviceId', { type: () => ID }) deviceId: string,
  ): Promise<Sensor[]> {
    console.log('Query: sensorsByDevice');
    const result = await this.sensorService.findByDevice(deviceId);
    return result as any;
  }

  @Query(() => Sensor)
  @UseGuards(AuthGuard)
  public async sensor(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Sensor> {
    console.log('Query: sensor');
    const result = await this.sensorService.findOne(id);
    return result as any;
  }

  @Mutation(() => Sensor)
  @UseGuards(AuthGuard)
  public async updateSensor(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSensorInput,
  ): Promise<Sensor> {
    console.log('Mutation: updateSensor');
    const result = await this.sensorService.update(id, input);
    return result as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  public async deleteSensor(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    console.log('Mutation: deleteSensor');
    const result = await this.sensorService.remove(id);
    return result as any;
  }
}
