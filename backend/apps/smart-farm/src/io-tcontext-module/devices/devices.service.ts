import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  DeviceWithSensors,
  CreateDeviceInput,
  UpdateDeviceInput,
  FilterDevicesInput,
  DeviceStatus,
  DeviceType,
  GreenhouseDeviceOverview,
} from '../../libs/dto/iot-context-dto/devices/device';

export interface IDevice extends Document {
  _id: Types.ObjectId;
  deviceName: string;
  deviceType: string;
  deviceStatus: string;
  installedAt: Date;
  greenHouseId: Types.ObjectId;
  sectionId?: Types.ObjectId;
  networkType?: string;
  powerSource?: string;
  rssi?: number;
  snr?: number;
  lastDataReceived?: Date;
  latitude?: number;
  longitude?: number;
  apiKeyHash?: string;
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
  ) {}

  async create(input: CreateDeviceInput): Promise<IDevice> {
    const device = await this.deviceModel.create({
      ...input,
      installedAt: new Date(input.installedAt),
      deviceStatus: DeviceStatus.OFFLINE,
      greenHouseId: new Types.ObjectId(input.greenHouseId),
      sectionId: input.sectionId
        ? new Types.ObjectId(input.sectionId)
        : undefined,
    });
    this.logger.log(
      `Device created | ${device.deviceName} | type=${device.deviceType}`,
    );
    return device;
  }

  async findOne(id: string): Promise<IDevice> {
    const device = await this.deviceModel.findById(id).exec();
    if (!device) throw new NotFoundException('Device not found.');
    return device;
  }

  async update(id: string, input: UpdateDeviceInput): Promise<IDevice> {
    const device = await this.deviceModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!device) throw new NotFoundException('Device not found.');
    return device;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.deviceModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Device not found.');
    return true;
  }

  async updateStatus(id: string, status: DeviceStatus): Promise<IDevice> {
    const device = await this.deviceModel
      .findByIdAndUpdate(id, { deviceStatus: status }, { new: true })
      .exec();
    if (!device) throw new NotFoundException('Device not found.');
    this.logger.log(`Device status | ${device.deviceName} → ${status}`);
    return device;
  }

  async updateTelemetry(
    deviceId: string,
    rssi?: number,
    snr?: number,
  ): Promise<IDevice> {
    const device = await this.deviceModel
      .findByIdAndUpdate(
        deviceId,
        {
          ...(rssi !== undefined ? { rssi } : {}),
          ...(snr !== undefined ? { snr } : {}),
          lastDataReceived: new Date(),
          deviceStatus: DeviceStatus.ONLINE,
        },
        { new: true },
      )
      .exec();
    if (!device) throw new NotFoundException('Device not found.');
    return device;
  }

  async filter(input: FilterDevicesInput): Promise<IDevice[]> {
    const query: any = {
      greenHouseId: new Types.ObjectId(input.greenHouseId),
    };
    if (input.deviceType) query.deviceType = input.deviceType;
    if (input.deviceStatus) query.deviceStatus = input.deviceStatus;

    return this.deviceModel.find(query).sort({ installedAt: -1 }).exec();
  }

  async findWithSensors(id: string): Promise<DeviceWithSensors> {
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
      sectionId: device.sectionId ? String(device.sectionId) : undefined,
      networkType: device.networkType,
      powerSource: device.powerSource,
      rssi: device.rssi,
      snr: device.snr,
      lastDataReceived: device.lastDataReceived,
      latitude: device.latitude,
      longitude: device.longitude,
      updatedAt: device.updatedAt,
      sensors: sensors.map((s) => ({
        _id: String(s._id),
        sensorType: s.sensorType,
        sensorsUnit: s.sensorsUnit,
      })),
    };
  }

  async getGreenhouseOverview(
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
