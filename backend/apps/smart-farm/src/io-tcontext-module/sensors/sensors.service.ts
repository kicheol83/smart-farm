import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateSensorInput,
  UpdateSensorInput,
} from '../../libs/dto/iot-context-dto/sensors/sensor';
import { Message } from '../../libs/types/common';
import { Device } from '../../libs/dto/iot-context-dto/devices/device';

export interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  sensorsUnit: string;
  deviceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SensorsService {
  private readonly logger = new Logger(SensorsService.name);

  constructor(
    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('devices')
    private readonly deviceModel: Model<Device>,
  ) {}

  public async create(input: CreateSensorInput): Promise<ISensor> {
    if (!Types.ObjectId.isValid(input.deviceId)) {
      throw new BadRequestException('Invalid deviceId');
    }
    const device = await this.deviceModel.findById(input.deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    const result = await this.sensorModel.create({
      ...input,
      deviceId: new Types.ObjectId(input.deviceId),
    });
    this.logger.log(
      `Sensor created | type=${result.sensorType} | device=${input.deviceId}`,
    );
    return result;
  }

  public async findByDevice(deviceId: string): Promise<ISensor[]> {
    const result = await this.sensorModel
      .find({ deviceId: new Types.ObjectId(deviceId) })
      .exec();
    return result;
  }

  public async findOne(id: string): Promise<ISensor> {
    const result = await this.sensorModel.findById(id).exec();
    if (!result) throw new NotFoundException(Message.SENSOR_NOT_FOUND);
    return result;
  }

  public async update(id: string, input: UpdateSensorInput): Promise<ISensor> {
    const result = await this.sensorModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!result) throw new NotFoundException(Message.SENSOR_NOT_FOUND);
    return result;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.sensorModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException(Message.SENSOR_NOT_FOUND);
    return true;
  }
}
