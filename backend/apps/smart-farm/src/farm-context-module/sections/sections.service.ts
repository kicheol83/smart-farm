import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateSectionInput,
  UpdateSectionInput,
  UpdateSectionHealthInput,
  SectionStatus,
  SectionHealthSummary,
  GreenhouseSectionOverview,
} from '../../libs/dto/farm-context-dto/sections/sections';
import { Crops } from '../../libs/dto/farm-context-dto/crops/crops';
import { AlertSeverity } from '../../libs/enums/alerts.enum';
import { AlertsService } from '../../ops-context-module/alerts/alerts.service';

export interface ISection extends Document {
  _id: Types.ObjectId;
  sectionName: string;
  sectionType: string;
  sectionStatus: string;
  sectionArea: number;
  plantCount: number;
  currentHealthIndex?: number;
  greenHouseId: Types.ObjectId;
  cropsId?: Types.ObjectId;
  mapPositionX?: number;
  mapPositionY?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IGreenhouse extends Document {
  greenHouseName: string;
}

interface IPlantHealth extends Document {
  plantHealthIndex: number;
  plantValue: number;
  recordeAt: Date;
  fieldsId: Types.ObjectId;
}

interface ISensorData extends Document {
  sensorDataValue: number;
  recordedAt: Date;
  sensorId: Types.ObjectId;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  deviceId: Types.ObjectId;
}

interface IDevice extends Document {
  _id: Types.ObjectId;
  greenHouseId: Types.ObjectId;
}

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);

  constructor(
    @InjectModel('sections')
    private readonly sectionModel: Model<ISection>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,

    @InjectModel('plantHealth')
    private readonly plantHealthModel: Model<IPlantHealth>,

    @InjectModel('sensor_data')
    private readonly sensorDataModel: Model<ISensorData>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('crops')
    private cropModel: Model<Crops>,

    private readonly alertService: AlertsService,
  ) {}

  public async create(input: CreateSectionInput): Promise<ISection> {
    if (!Types.ObjectId.isValid(input.greenHouseId)) {
      throw new BadRequestException('Invalid greenHouseId');
    }

    if (!Types.ObjectId.isValid(input.cropsId)) {
      throw new BadRequestException('Invalid cropsId');
    }

    const crop = await this.cropModel.findById(input.cropsId);
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const greenHouse = await this.greenhouseModel.findById(input.greenHouseId);
    if (!greenHouse) {
      throw new NotFoundException('greenHouse not found');
    }
    const section = await this.sectionModel.create({
      ...input,
      greenHouseId: new Types.ObjectId(input.greenHouseId),
      cropsId: input.cropsId ? new Types.ObjectId(input.cropsId) : null,
    });
    this.logger.log(
      `Section created | ${section.sectionName} | gh=${input.greenHouseId}`,
    );
    return section;
  }

  public async findByGreenhouse(greenHouseId: string): Promise<ISection[]> {
    const result = await this.sectionModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .populate('cropsId')
      .sort({ createdAt: 1 })
      .exec();

    return result;
  }

  public async findOne(id: string): Promise<ISection> {
    const section = await this.sectionModel
      .findById(id)
      .populate('cropsId')
      .exec();
    if (!section) throw new NotFoundException('Section not found.');
    return section;
  }

  public async update(
    id: string,
    input: UpdateSectionInput,
  ): Promise<ISection> {
    const updateData: any = { ...input };
    if (input.cropsId) updateData.cropsId = new Types.ObjectId(input.cropsId);

    const section = await this.sectionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!section) throw new NotFoundException('Section not found.');
    return section;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.sectionModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Section not found.');
    return true;
  }

  async updateHealth(input: UpdateSectionHealthInput): Promise<ISection> {
    const status = this.resolveStatus(input.healthIndex);

    const section = await this.sectionModel
      .findByIdAndUpdate(
        input.sectionId,
        {
          currentHealthIndex: input.healthIndex,
          sectionStatus: status,
        },
        { new: true },
      )
      .exec();

    if (!section) throw new NotFoundException('Section not found.');
    this.logger.log(
      `Section health updated | ${section.sectionName} | index=${input.healthIndex} | status=${status}`,
    );

    if (status === SectionStatus.CRITICAL) {
      await this.alertService.createPlantHealthAlert(
        String(section._id),
        AlertSeverity.CRITICAL,
        `${section.sectionName} health dropped to ${input.healthIndex}%`,
        input.healthIndex,
      );
    } else if (status === SectionStatus.WARNING) {
      await this.alertService.createPlantHealthAlert(
        String(section._id),
        AlertSeverity.WARNING,
        `${section.sectionName} health at ${input.healthIndex}% — needs attention`,
        input.healthIndex,
      );
    }

    return section;
  }

  async getGreenhouseOverview(
    greenHouseId: string,
  ): Promise<GreenhouseSectionOverview> {
    const greenhouse = await this.greenhouseModel.findById(greenHouseId).exec();
    if (!greenhouse) throw new NotFoundException('Greenhouse not found.');

    const sections = await this.sectionModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .exec();

    const sectionSummaries: SectionHealthSummary[] = await Promise.all(
      sections.map((s) => this.buildSectionSummary(s, greenHouseId)),
    );

    const healthy = sectionSummaries.filter(
      (s) => s.sectionStatus === SectionStatus.HEALTHY,
    ).length;
    const warning = sectionSummaries.filter(
      (s) => s.sectionStatus === SectionStatus.WARNING,
    ).length;
    const critical = sectionSummaries.filter(
      (s) => s.sectionStatus === SectionStatus.CRITICAL,
    ).length;

    const overallIndex = sectionSummaries.length
      ? sectionSummaries.reduce((s, sec) => s + sec.healthIndex, 0) /
        sectionSummaries.length
      : 0;

    return {
      greenHouseId,
      greenHouseName: greenhouse.greenHouseName,
      totalSections: sections.length,
      healthySections: healthy,
      warningSections: warning,
      criticalSections: critical,
      overallHealthIndex: Math.round(overallIndex * 10) / 10,
      sections: sectionSummaries,
    };
  }

  public async getSectionDetail(
    sectionId: string,
  ): Promise<SectionHealthSummary> {
    const section = await this.sectionModel.findById(sectionId).exec();
    if (!section) throw new NotFoundException('Section not found.');
    return this.buildSectionSummary(section, String(section.greenHouseId));
  }

  private async buildSectionSummary(
    section: ISection,
    greenHouseId: string,
  ): Promise<SectionHealthSummary> {
    const sensorData = await this.getLatestSensorData(greenHouseId);

    const healthIndex = section.currentHealthIndex ?? 0;
    const status = this.resolveStatus(healthIndex);

    return {
      sectionId: String(section._id),
      sectionName: section.sectionName,
      sectionStatus: status as SectionStatus,
      healthIndex,
      temperature: sensorData['TEMPERATURE'],
      humidity: sensorData['HUMIDITY'],
      soilMoisture: sensorData['SOIL_MOISTURE'],
      ph: sensorData['PH'],
      mapPositionX: section.mapPositionX,
      mapPositionY: section.mapPositionY,
      lastUpdated: section.updatedAt,
    };
  }

  private async getLatestSensorData(
    greenHouseId: string,
  ): Promise<Record<string, number>> {
    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .select('_id')
      .exec();
    console.log('devices', devices);
    const deviceIds = devices.map((d) => d._id);
    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds } })
      .exec();

    console.log('sensors', sensors);

    const result: Record<string, number> = {};

    for (const sensor of sensors) {
      const latest = await this.sensorDataModel
        .findOne({ sensorId: sensor._id })
        .sort({ recordedAt: -1 })
        .exec();

      console.log('SensorData =>', sensor.sensorType, latest);

      if (latest) result[sensor.sensorType] = latest.sensorDataValue;
    }

    return result;
  }

  private resolveStatus(healthIndex: number): SectionStatus {
    if (healthIndex >= 80) return SectionStatus.HEALTHY;
    if (healthIndex >= 50) return SectionStatus.WARNING;
    return SectionStatus.CRITICAL;
  }
}
