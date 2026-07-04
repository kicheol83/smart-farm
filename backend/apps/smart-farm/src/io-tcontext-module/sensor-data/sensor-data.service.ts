import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateSensorDataInput,
  GreenhouseSensorSummary,
} from '../../libs/dto/iot-context-dto/sensors/sensor.data';

export interface ISensorData extends Document {
  _id: Types.ObjectId;
  sensorDataName: string;
  sensorDataValue: number;
  recordedAt: Date;
  sensorId: Types.ObjectId;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  sensorsUnit: string;
  deviceId: Types.ObjectId;
}

interface IDevice extends Document {
  _id: Types.ObjectId;
  greenHouseId: Types.ObjectId;
}

interface IGreenhouse extends Document {
  _id: Types.ObjectId;
  greenHouseName: string;
}

@Injectable()
export class SensorDataService {
  private readonly logger = new Logger(SensorDataService.name);

  constructor(
    @InjectModel('sensor_data')
    private readonly sensorDataModel: Model<ISensorData>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,
  ) {}

  public async create(input: CreateSensorDataInput): Promise<ISensorData> {
    if (!Types.ObjectId.isValid(input.sensorId)) {
      throw new BadRequestException('Invalid sensorId');
    }
    const sensor = await this.sensorModel.findById(input.sensorId);
    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }
    const result = await this.sensorDataModel.create({
      ...input,
      recordedAt: new Date(input.recordedAt),
      sensorId: new Types.ObjectId(input.sensorId),
    });
    return result;
  }

  public async findBySensor(
    sensorId: string,
    limit = 20,
  ): Promise<ISensorData[]> {
    const result = await this.sensorDataModel
      .find({ sensorId: new Types.ObjectId(sensorId) })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .exec();
    return result;
  }

 
  public async getGreenhouseSummary(
    greenHouseId: string,
  ): Promise<GreenhouseSensorSummary> {
    const greenhouse = await this.greenhouseModel.findById(greenHouseId).exec();

    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .select('_id')
      .exec();

    const deviceIds = devices.map((d) => d._id);
    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds } })
      .exec();

    const summary: Partial<GreenhouseSensorSummary> = {
      greenHouseId,
      greenHouseName: greenhouse?.greenHouseName ?? '',
      lastUpdated: new Date(),
    };

    for (const sensor of sensors) {
      const result = await this.sensorDataModel
        .findOne({ sensorId: sensor._id })
        .sort({ recordedAt: -1 })
        .exec();

      if (!result) continue;

      switch (sensor.sensorType) {
        case 'TEMPERATURE':
          summary.temperature = result.sensorDataValue;
          break;
        case 'HUMIDITY':
          summary.humidity = result.sensorDataValue;
          break;
        case 'PH':
          summary.ph = result.sensorDataValue;
          break;
        case 'LIGHT':
          summary.light = result.sensorDataValue;
          break;
        case 'CO2':
          summary.co2 = result.sensorDataValue;
          break;
        case 'SOIL_MOISTURE':
          summary.soilMoisture = result.sensorDataValue;
          break;
      }

      if (result.recordedAt > summary.lastUpdated!) {
        summary.lastUpdated = result.recordedAt;
      }
    }

    return summary as GreenhouseSensorSummary;
  }

  public async getHistory(
    sensorId: string,
    from: Date,
    to: Date,
  ): Promise<ISensorData[]> {
    const result = await this.sensorDataModel
      .find({
        sensorId: new Types.ObjectId(sensorId),
        recordedAt: { $gte: from, $lte: to },
      })
      .sort({ recordedAt: 1 })
      .exec();
    return result;
  }
}
