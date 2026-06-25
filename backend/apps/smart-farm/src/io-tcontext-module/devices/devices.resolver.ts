import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  FilterDevicesInput,
  Device,
  DeviceWithSensors,
  GreenhouseDeviceOverview,
  CreateDeviceInput,
  UpdateDeviceInput,
  DeviceStatus,
} from '../../libs/dto/iot-context-dto/devices/device';
import { DevicesService } from './devices.service';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';
import { Member } from '../../libs/dto/account-context-dto/member/member';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(private readonly deviceService: DevicesService) {}

  @Mutation(() => Device, { description: 'Figma: Add New Device modal' })
  @UseGuards(AuthGuard)
  public async createDevice(
    @Args('input') input: CreateDeviceInput,
    @AuthMember() member: Member,
  ): Promise<Device> {
    const result = await this.deviceService.create(input, member);
    return result as any;
  }

  @Query(() => DeviceWithSensors, { description: 'Device + uning sensorlari' })
  @UseGuards(AuthGuard)
  public async deviceWithSensors(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeviceWithSensors> {
    const result = await this.deviceService.findWithSensors(id);
    return result;
  }

  @Query(() => GreenhouseDeviceOverview)
  @UseGuards(AuthGuard)
  public async greenhouseDeviceOverview(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<GreenhouseDeviceOverview> {
    const result = await this.deviceService.getGreenhouseOverview(greenHouseId);
    return result;
  }

  @Query(() => [Device])
  @UseGuards(AuthGuard)
  public async filterDevices(
    @Args('input') input: FilterDevicesInput,
  ): Promise<Device[]> {
    return this.deviceService.filter(input) as any;
  }

  @Mutation(() => Device)
  @UseGuards(AuthGuard)
  public async updateDevice(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDeviceInput,
  ): Promise<Device> {
    const result = await this.deviceService.update(id, input);
    return result as any;
  }

  @Mutation(() => Device)
  @UseGuards(AuthGuard)
  public async updateDeviceStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => DeviceStatus }) status: DeviceStatus,
  ): Promise<Device> {
    const result = await this.deviceService.updateStatus(id, status);
    return result as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  public async deleteDevice(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.deviceService.remove(id);
    return result;
  }
}
