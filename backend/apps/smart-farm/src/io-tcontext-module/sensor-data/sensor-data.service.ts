import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { ActuatorService } from '../../actuator/actuator.service';
import { TimeseriesService } from '../../mid-iot/timeseries/timeseries.service';
import { AnomalyDetectionService } from '../../mid-iot/anomaly-detection/anomaly-detection.service';
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
  sectionId?: Types.ObjectId;
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

    private readonly actuatorService: ActuatorService,
    private readonly timeseriesService: TimeseriesService,
    private readonly anomalyDetectionService: AnomalyDetectionService,
  ) {}

  async verifySensorBelongsToDevice(
    sensorId: string,
    deviceId: string,
  ): Promise<boolean> {
    const sensor = await this.sensorModel.findById(sensorId).exec();
    if (!sensor) return false;
    return String(sensor.deviceId) === String(deviceId);
  }

  async create(input: CreateSensorDataInput): Promise<ISensorData> {
    if (!Types.ObjectId.isValid(input.sensorId)) {
      throw new BadRequestException('Invalid sensorId');
    }
    const sensor = await this.sensorModel.findById(input.sensorId);
    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }
    const record = await this.sensorDataModel.create({
      ...input,
      recordedAt: new Date(input.recordedAt),
      sensorId: new Types.ObjectId(input.sensorId),
    });

    this.evaluateAutomationForSensor(
      input.sensorId,
      record.sensorDataValue,
    ).catch((err) => {
      this.logger.error(
        `Automation evaluation failed | sensorId=${input.sensorId} | ${err.message}`,
      );
    });

    this.recordDerivedData(sensor, record).catch((err) => {
      this.logger.error(
        `Derived data write failed | sensorId=${input.sensorId} | ${err.message}`,
      );
    });

    return record;
  }

  private async recordDerivedData(
    sensor: ISensor,
    record: ISensorData,
  ): Promise<void> {
    const device = await this.deviceModel.findById(sensor.deviceId).exec();
    if (!device) return;

    await this.timeseriesService.insert(
      String(sensor._id),
      sensor.sensorType,
      String(device._id),
      sensor.sensorsUnit || 'unknown',
      record.sensorDataValue,
      record.recordedAt,
    );

    await this.anomalyDetectionService.check(
      String(sensor._id),
      sensor.sensorType,
      String(device._id),
      String(device.greenHouseId),
      record.sensorDataValue,
    );
  }

  private async evaluateAutomationForSensor(
    sensorId: string,
    value: number,
  ): Promise<void> {
    const sensor = await this.sensorModel.findById(sensorId).exec();
    if (!sensor) return;

    const device = await this.deviceModel.findById(sensor.deviceId).exec();
    if (!device) return;

    await this.actuatorService.evaluateRules(
      String(device.greenHouseId),
      sensor.sensorType,
      value,
      device.sectionId ? String(device.sectionId) : undefined,
    );
  }

  async findBySensor(sensorId: string, limit = 20): Promise<ISensorData[]> {
    return this.sensorDataModel
      .find({ sensorId: new Types.ObjectId(sensorId) })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .exec();
  }

  async getGreenhouseSummary(
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
      const latest = await this.sensorDataModel
        .findOne({ sensorId: sensor._id })
        .sort({ createdAt: -1 })
        .exec();

      if (!latest) continue;

      switch (sensor.sensorType) {
        case 'TEMPERATURE':
          summary.temperature = latest.sensorDataValue;
          break;
        case 'HUMIDITY':
          summary.humidity = latest.sensorDataValue;
          break;
        case 'PH':
          summary.ph = latest.sensorDataValue;
          break;
        case 'LIGHT':
          summary.light = latest.sensorDataValue;
          break;
        case 'CO2':
          summary.co2 = latest.sensorDataValue;
          break;
        case 'SOIL_MOISTURE':
          summary.soilMoisture = latest.sensorDataValue;
          break;
      }

      if (latest.recordedAt > summary.lastUpdated!) {
        summary.lastUpdated = latest.recordedAt;
      }
    }

    return summary as GreenhouseSensorSummary;
  }

  async getHistory(
    sensorId: string,
    from: Date,
    to: Date,
  ): Promise<ISensorData[]> {
    return this.sensorDataModel
      .find({
        sensorId: new Types.ObjectId(sensorId),
        recordedAt: { $gte: from, $lte: to },
      })
      .sort({ recordedAt: 1 })
      .exec();
  }

  async getTodayTemperatureRange(
    greenHouseId: string,
  ): Promise<{ high?: number; low?: number }> {
    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .select('_id')
      .exec();
    const deviceIds = devices.map((d) => d._id);

    const tempSensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds }, sensorType: 'TEMPERATURE' })
      .select('_id')
      .exec();
    const sensorIds = tempSensors.map((s) => s._id);

    if (sensorIds.length === 0) return {};

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const readings = await this.sensorDataModel
      .find({ sensorId: { $in: sensorIds }, recordedAt: { $gte: startOfDay } })
      .select('sensorDataValue')
      .exec();

    if (readings.length === 0) return {};

    const values = readings.map((r) => r.sensorDataValue);
    return {
      high: Math.max(...values),
      low: Math.min(...values),
    };
  }
}
