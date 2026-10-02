import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  RecordSectionHealthInput,
  GetSectionHealthTrendInput,
  SectionHealthTrend,
  GreenhousePlantHealthOverview,
  SectionPlantHealth,
} from '../../libs/dto/farm-context-dto/plant-health/plant-health-monitoring';
import { IField } from '../fields/fields.service';

interface IPlantHealth extends Document {
  _id: Types.ObjectId;
  plantHealthIndex: number;
  plantValue: number;
  recordeAt: Date;
  fieldsId: Types.ObjectId;
}

interface ISection extends Document {
  _id: Types.ObjectId;
  sectionName: string;
  sectionStatus: string;
  plantCount: number;
  currentHealthIndex?: number;
  greenHouseId: Types.ObjectId;
}

interface IGreenhouse extends Document {
  greenHouseName: string;
}

const OPTIMAL_RANGES: Record<string, [number, number]> = {
  TEMPERATURE: [18, 28],
  HUMIDITY: [50, 80],
  SOIL_MOISTURE: [35, 70],
  PH: [5.8, 7.0],
  CO2: [400, 1000],
  WATER_EC: [1.2, 2.5],
};

@Injectable()
export class PlantHealthMonitoringService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PlantHealthMonitoringService.name);

  constructor(
    @InjectModel('plantHealth')
    private readonly plantHealthModel: Model<IPlantHealth>,

    @InjectModel('sections')
    private readonly sectionModel: Model<ISection>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,

    @InjectModel('fields')
    private readonly fieldModel: Model<IField>,

    @InjectModel('devices')
    private readonly deviceModel: Model<any>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<any>,

    @InjectModel('sensor_data')
    private readonly sensorDataModel: Model<any>,
  ) {}

  onApplicationBootstrap(): void {
    this.computeFromSensors().catch((err: Error) =>
      this.logger.error(`Initial plant health computation failed | ${err.message}`),
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async computeFromSensors(): Promise<number> {
    const since = new Date(Date.now() - 24 * 3600000);
    const sections = await this.sectionModel.find().exec();
    let updated = 0;

    for (const section of sections) {
      const sectionDevices = await this.deviceModel
        .find({ sectionId: section._id })
        .select('_id')
        .lean<{ _id: Types.ObjectId }[]>()
        .exec();
      const devices =
        sectionDevices.length > 0
          ? sectionDevices
          : await this.deviceModel
              .find({ greenHouseId: (section as any).greenHouseId })
              .select('_id')
              .lean<{ _id: Types.ObjectId }[]>()
              .exec();
      if (devices.length === 0) continue;

      const sensors = await this.sensorModel
        .find({ deviceId: { $in: devices.map((d) => d._id) }, sensorType: { $in: Object.keys(OPTIMAL_RANGES) } })
        .select('_id sensorType')
        .lean<{ _id: Types.ObjectId; sensorType: string }[]>()
        .exec();
      if (sensors.length === 0) continue;

      const typeBySensor = new Map(sensors.map((s) => [String(s._id), s.sensorType]));
      const inRangeExpression = {
        $switch: {
          branches: Object.entries(OPTIMAL_RANGES).map(([type, [min, max]]) => ({
            case: { $eq: ['$sensorDataName', type] },
            then: {
              $cond: [
                { $and: [{ $gte: ['$sensorDataValue', min] }, { $lte: ['$sensorDataValue', max] }] },
                1,
                0,
              ],
            },
          })),
          default: 0,
        },
      };
      const buckets = await this.sensorDataModel.aggregate<{
        _id: Types.ObjectId;
        total: number;
        inRange: number;
        sum: number;
      }>([
        { $match: { sensorId: { $in: sensors.map((s) => s._id) }, recordedAt: { $gte: since } } },
        {
          $group: {
            _id: '$sensorId',
            total: { $sum: 1 },
            inRange: { $sum: inRangeExpression },
            sum: { $sum: '$sensorDataValue' },
          },
        },
      ]);
      if (buckets.length === 0) continue;

      const scores: number[] = [];
      let soilSum = 0;
      let soilCount = 0;
      for (const bucket of buckets) {
        const type = typeBySensor.get(String(bucket._id));
        if (!type) continue;
        scores.push((bucket.inRange / bucket.total) * 100);
        if (type === 'SOIL_MOISTURE') {
          soilSum += bucket.sum;
          soilCount += bucket.total;
        }
      }
      if (scores.length === 0) continue;

      const healthIndex = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      const plantValue = soilCount > 0 ? Math.round((soilSum / soilCount) * 10) / 10 : healthIndex;

      await this.plantHealthModel.create({
        plantHealthIndex: healthIndex,
        plantValue,
        recordeAt: new Date(),
        fieldsId: section._id,
      });
      await this.sectionModel.updateOne(
        { _id: section._id },
        { currentHealthIndex: healthIndex, sectionStatus: this.toSectionStatus(healthIndex) },
      );
      updated += 1;
    }

    if (updated > 0) {
      this.logger.log(`Plant health computed from sensors | sections=${updated}`);
    }
    return updated;
  }

  private toSectionStatus(index: number): string {
    if (index >= 80) return 'HEALTHY';
    if (index >= 50) return 'WARNING';
    return 'CRITICAL';
  }

  public async record(
    input: RecordSectionHealthInput,
  ): Promise<SectionPlantHealth> {
    if (!Types.ObjectId.isValid(input.fieldsId)) {
      throw new BadRequestException('Invalid fieldsId');
    }

    const field = await this.fieldModel.findById(input.fieldsId);
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    const record = await this.plantHealthModel.create({
      plantHealthIndex: input.plantHealthIndex,
      plantValue: input.plantValue,
      recordeAt: new Date(input.recordeAt),
      fieldsId: new Types.ObjectId(input.fieldsId),
    });

    const status = this.resolveStatus(input.plantHealthIndex);
    await this.sectionModel.findByIdAndUpdate(input.fieldsId, {
      currentHealthIndex: input.plantHealthIndex,
      sectionStatus: status,
    });

    this.logger.log(
      `PlantHealth recorded | field=${input.fieldsId} | index=${input.plantHealthIndex} | status=${status}`,
    );

    return {
      _id: String(record._id),
      plantHealthIndex: record.plantHealthIndex,
      plantValue: record.plantValue,
      recordeAt: record.recordeAt,
      fieldsId: input.fieldsId,
    };
  }

  public async getSectionTrend(
    input: GetSectionHealthTrendInput,
  ): Promise<SectionHealthTrend> {
    if (!Types.ObjectId.isValid(input.sectionId)) {
      throw new BadRequestException('Invalid sectionId');
    }

    const section = await this.sectionModel.findById(input.sectionId).exec();
    if (!section) throw new NotFoundException('Section not found.');

    const from = input.from ? new Date(input.from) : this.daysAgo(30);
    const to = input.to ? new Date(input.to) : new Date();

    const records = await this.plantHealthModel
      .find({
        fieldsId: new Types.ObjectId(input.sectionId),
        recordeAt: { $gte: from, $lte: to },
      })
      .sort({ recordeAt: 1 })
      .limit(100)
      .exec();

    const current = records.at(-1)?.plantHealthIndex ?? 0;
    const first = records.at(0)?.plantHealthIndex ?? 0;
    const changePercent =
      first > 0 ? Math.round(((current - first) / first) * 100 * 10) / 10 : 0;

    return {
      sectionId: String(section._id),
      sectionName: section.sectionName,
      currentIndex: current,
      changePercent,
      status: this.resolveStatus(current),
      trend: records.map((r) => ({
        date: r.recordeAt,
        healthIndex: r.plantHealthIndex,
        plantValue: r.plantValue,
      })),
    };
  }

  public async getGreenhouseOverview(
    greenHouseId: string,
  ): Promise<GreenhousePlantHealthOverview> {
    const greenhouse = await this.greenhouseModel.findById(greenHouseId).exec();
    if (!greenhouse) throw new NotFoundException('Greenhouse not found.');

    const sections = await this.sectionModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .exec();

    const sectionTrends = await Promise.all(
      sections.map((s) => this.getSectionTrend({ sectionId: String(s._id) })),
    );

    const totalPlants = sections.reduce((sum, s) => sum + s.plantCount, 0);
    const healthyPlants = sections
      .filter((s) => (s.currentHealthIndex ?? 0) >= 80)
      .reduce((sum, s) => sum + s.plantCount, 0);
    const warningPlants = sections
      .filter((s) => {
        const idx = s.currentHealthIndex ?? 0;
        return idx >= 50 && idx < 80;
      })
      .reduce((sum, s) => sum + s.plantCount, 0);
    const criticalPlants = sections
      .filter((s) => (s.currentHealthIndex ?? 0) < 50)
      .reduce((sum, s) => sum + s.plantCount, 0);

    const overallIndex = sections.length
      ? sections.reduce((sum, s) => sum + (s.currentHealthIndex ?? 0), 0) /
        sections.length
      : 0;

    return {
      greenHouseId,
      greenHouseName: greenhouse.greenHouseName,
      overallHealthIndex: Math.round(overallIndex * 10) / 10,
      totalPlants,
      healthyPlants,
      warningPlants,
      criticalPlants,
      sectionTrends,
    };
  }

  private resolveStatus(index: number): string {
    if (index >= 80) return 'good';
    if (index >= 50) return 'warning';
    return 'critical';
  }

  private daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }
}
