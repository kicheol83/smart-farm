import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateDeviceInput,
  UpdateDeviceInput,
  FilterDevicesInput,
  DeviceStatus,
  DeviceType,
  GreenhouseDeviceOverview,
  DeviceWithSensors,
} from '../../libs/dto/iot-context-dto/devices/device';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { ActionLogService, IActionLog } from '../action-log/action-log.service';
import {
  ActionResource,
  ActionType,
} from '../../libs/dto/iot-context-dto/action-log/action-log';

export interface IDevice extends Document {
  _id: Types.ObjectId;
  deviceName: string;
  deviceType: string;
  deviceStatus: string;
  installedAt: Date;
  greenHouseId: Types.ObjectId;
  updatedAt: Date;
}

interface IGreenhouse extends Document {
  greenHouseName: string;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  sensorsUnit: string;
  deviceId: Types.ObjectId;
}

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    private readonly actionLogService: ActionLogService,
  ) {}

  public async create(
    input: CreateDeviceInput,
    member: Member,
  ): Promise<IDevice> {
    if (!Types.ObjectId.isValid(input.greenHouseId)) {
      throw new BadRequestException('Invalid greenHouseId');
    }

    const greenhouse = await this.greenhouseModel.findById(input.greenHouseId);
    if (!greenhouse) {
      throw new NotFoundException('Greenhouse not found');
    }

    const device = await this.deviceModel.create({
      ...input,
      installedAt: new Date(input.installedAt),
      deviceStatus: DeviceStatus.OFFLINE,
      greenHouseId: new Types.ObjectId(input.greenHouseId),
    });

    this.logger.log(
      `Device created | ${device.deviceName} | type=${device.deviceType}`,
    );

    await this.actionLogService.log({
      actionType: ActionType.CREATE,
      actionResource: ActionResource.DEVICE,
      description: `Device "${device.deviceName}" created.`,
      resourceId: device._id.toString(),
      memberId: member._id.toString(),
      memberFullName: member.memberFullName,
    });

    return device;
  }

  public async findOne(id: string): Promise<IDevice> {
    const device = await this.deviceModel.findById(id).exec();
    if (!device) throw new NotFoundException('Device not found.');
    return device;
  }

  public async update(id: string, input: UpdateDeviceInput): Promise<IDevice> {
    const device = await this.deviceModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!device) throw new NotFoundException('Device not found.');
    return device;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.deviceModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Device not found.');
    return true;
  }

  public async updateStatus(
    id: string,
    status: DeviceStatus,
  ): Promise<IDevice> {
    const device = await this.deviceModel
      .findByIdAndUpdate(id, { deviceStatus: status }, { new: true })
      .exec();
    if (!device) throw new NotFoundException('Device not found.');
    this.logger.log(`Device status | ${device.deviceName} → ${status}`);
    return device;
  }

  public async filter(input: FilterDevicesInput): Promise<IDevice[]> {
    const query: any = {
      greenHouseId: new Types.ObjectId(input.greenHouseId),
    };
    if (input.deviceType) query.deviceType = input.deviceType;
    if (input.deviceStatus) query.deviceStatus = input.deviceStatus;

    return this.deviceModel.find(query).sort({ installedAt: -1 }).exec();
  }

  public async findWithSensors(id: string): Promise<DeviceWithSensors> {
    const device = await this.deviceModel.findById(id).exec();
    if (!device) throw new NotFoundException('Device not found.');

    const sensors = await this.sensorModel
      .find({ deviceId: device._id })
      .exec();

    return {
      _id: String(device._id),
      deviceName: device.deviceName,
      deviceType: device.deviceType as DeviceType,
      deviceStatus: device.deviceStatus as DeviceStatus,
      installedAt: device.installedAt,
      greenHouseId: String(device.greenHouseId),
      updatedAt: device.updatedAt,
      sensors: sensors.map((s) => ({
        _id: String(s._id),
        sensorType: s.sensorType,
        sensorsUnit: s.sensorsUnit,
      })),
    };
  }

  public async getGreenhouseOverview(
    greenHouseId: string,
  ): Promise<GreenhouseDeviceOverview> {
    const greenhouse = await this.greenhouseModel.findById(greenHouseId).exec();
    if (!greenhouse) throw new NotFoundException('Greenhouse not found.');

    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ installedAt: -1 })
      .exec();
    const statusCounts = {
      total: devices.length,
      online: devices.filter((d) => d.deviceStatus === DeviceStatus.ONLINE)
        .length,
      offline: devices.filter((d) => d.deviceStatus === DeviceStatus.OFFLINE)
        .length,
      maintenance: devices.filter(
        (d) => d.deviceStatus === DeviceStatus.MAINTENANCE,
      ).length,
      error: devices.filter((d) => d.deviceStatus === DeviceStatus.ERROR)
        .length,
    };

    const typeMap: Record<string, number> = {};
    for (const d of devices) {
      typeMap[d.deviceType] = (typeMap[d.deviceType] ?? 0) + 1;
    }
    const typeCounts = Object.entries(typeMap).map(([deviceType, count]) => ({
      deviceType: deviceType as DeviceType,
      count,
    }));

    return {
      greenHouseId,
      greenHouseName: greenhouse.greenHouseName,
      statusCounts,
      typeCounts,
      devices: devices as any,
    };
  }
}
