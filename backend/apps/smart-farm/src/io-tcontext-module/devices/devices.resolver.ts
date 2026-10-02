import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import {
  CreateDeviceInput,
  Device,
  DeviceStatus,
  DeviceWithSensors,
  FilterDevicesInput,
  GreenhouseDeviceOverview,
  UpdateDeviceInput,
  UpdateDeviceTelemetryInput,
} from '../../libs/dto/iot-context-dto/devices/device';
import { ActionLogService } from '../action-log/action-log.service';
import { AlertsService } from '../../ops-context-module/alerts/alerts.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';
import { RequestMeta } from '../../account-context-module/auth/decorators/requesr.meta.decorator';
import {
  ActionResource,
  ActionType,
} from '../../libs/dto/iot-context-dto/action-log/action-log';
import { AlertSeverity } from '../../libs/enums/alerts.enum';
import { OwnedBy } from '../../ownership/owned-by.decorator';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(
    private readonly deviceService: DevicesService,
    private readonly actionLogService: ActionLogService,
    private readonly alertService: AlertsService,
  ) {}

  @Mutation(() => Device)
  @UseGuards(AuthGuard)
  public async createDevice(
    @Args('input') input: CreateDeviceInput,
    @AuthMember() user: Member,
    @RequestMeta() meta: RequestMeta,
  ): Promise<Device> {
    const device = await this.deviceService.create(input);

    await this.actionLogService.log({
      actionType: ActionType.CREATE,
      actionResource: ActionResource.DEVICE,
      description: `Device ${device.deviceName} created`,
      resourceId: String(device._id),
      memberId: user._id.toString(),
      memberFullName: user.memberFullName,
      device: meta.device,
      ipAddress: meta.ipAddress,
      actionCode: 'DEV-01',
    });

    return device as any;
  }

  @Query(() => DeviceWithSensors)
  @UseGuards(AuthGuard)
  @OwnedBy('device')
  public async deviceWithSensors(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeviceWithSensors> {
    return this.deviceService.findWithSensors(id);
  }

  @Query(() => GreenhouseDeviceOverview, {})
  @UseGuards(AuthGuard)
  public async greenhouseDeviceOverview(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<GreenhouseDeviceOverview> {
    return this.deviceService.getGreenhouseOverview(greenHouseId);
  }

  @Query(() => [Device], {})
  @UseGuards(AuthGuard)
  public async filterDevices(
    @Args('input') input: FilterDevicesInput,
  ): Promise<Device[]> {
    return this.deviceService.filter(input) as any;
  }

  @Mutation(() => Device, { description: 'Device yangilash' })
  @UseGuards(AuthGuard)
  @OwnedBy('device')
  public async updateDevice(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDeviceInput,
    @AuthMember() user: Member,
    @RequestMeta() meta: RequestMeta,
  ): Promise<Device> {
    const device = await this.deviceService.update(id, input);

    await this.actionLogService.log({
      actionType: ActionType.UPDATE,
      actionResource: ActionResource.DEVICE,
      description: `Device ${device.deviceName} updated`,
      resourceId: id,
      memberId: user._id.toString(),
      memberFullName: user.memberFullName,
      device: meta.device,
      ipAddress: meta.ipAddress,
      actionCode: 'DEV-02',
    });

    return device as any;
  }

  @Mutation(() => Device)
  @UseGuards(AuthGuard)
  @OwnedBy('device')
  public async updateDeviceStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => DeviceStatus }) status: DeviceStatus,
    @AuthMember() user: Member,
    @RequestMeta() meta: RequestMeta,
  ): Promise<Device> {
    const device = await this.deviceService.updateStatus(id, status);

    await this.actionLogService.log({
      actionType: ActionType.UPDATE,
      actionResource: ActionResource.DEVICE,
      description: `Device ${device.deviceName} status changed to ${status}`,
      resourceId: id,
      memberId: user._id.toString(),
      memberFullName: user.memberFullName,
      device: meta.device,
      ipAddress: meta.ipAddress,
      actionCode: 'DEV-04',
    });

    if (status === DeviceStatus.ERROR) {
      await this.alertService.createSystemAlert(
        id,
        AlertSeverity.CRITICAL,
        `${device.deviceName} reported an error`,
      );
    } else if (status === DeviceStatus.OFFLINE) {
      await this.alertService.createSystemAlert(
        id,
        AlertSeverity.WARNING,
        `${device.deviceName} went offline`,
      );
    }

    return device as any;
  }

  @Mutation(() => Device, {})
  @UseGuards(AuthGuard)
  public async updateDeviceTelemetry(
    @Args('input') input: UpdateDeviceTelemetryInput,
  ): Promise<Device> {
    return this.deviceService.updateTelemetry(
      input.deviceId,
      input.rssi,
      input.snr,
    ) as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @OwnedBy('device')
  public async deleteDevice(
    @Args('id', { type: () => ID }) id: string,
    @AuthMember() user: Member,
    @RequestMeta() meta: RequestMeta,
  ): Promise<boolean> {
    const result = await this.deviceService.remove(id);

    await this.actionLogService.log({
      actionType: ActionType.DELETE,
      actionResource: ActionResource.DEVICE,
      description: `Device deleted`,
      resourceId: id,
      memberId: user._id.toString(),
      memberFullName: user.memberFullName,
      device: meta.device,
      ipAddress: meta.ipAddress,
      actionCode: 'DEV-03',
    });

    return result;
  }
}
