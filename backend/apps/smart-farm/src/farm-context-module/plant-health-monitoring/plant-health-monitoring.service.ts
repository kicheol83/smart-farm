import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class PlantHealthMonitoringService {
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
  ) {}

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

    // Har bir section uchun trend ma'lumotlari
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
