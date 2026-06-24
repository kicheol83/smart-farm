import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  RecordNdviInput,
  SectorNdviTrend,
  NdviRecord,
} from '../../libs/dto/farm-context-dto/ndvi/ndvi';
import { IField } from '../fields/fields.service';

interface INdviAnalytics extends Document {
  _id: Types.ObjectId;
  ndviValue: number;
  healthIndex?: number;
  soilMoisture?: number;
  recordedAt: Date;
  sectorId: Types.ObjectId;
  fieldId: Types.ObjectId;
}

interface IMapSector extends Document {
  _id: Types.ObjectId;
  sectorName: string;
  ndviValue?: number;
}

@Injectable()
export class NdviService {
  private readonly logger = new Logger(NdviService.name);

  constructor(
    @InjectModel('ndviAnalytics')
    private readonly ndviModel: Model<INdviAnalytics>,

    @InjectModel('mapSectors')
    private readonly sectorModel: Model<IMapSector>,

    @InjectModel('fields')
    private fieldModel: Model<IField>,
  ) {}

  public async record(input: RecordNdviInput): Promise<NdviRecord> {
    if (!Types.ObjectId.isValid(input.sectorId)) {
      throw new BadRequestException('Invalid sectorId');
    }

    if (!Types.ObjectId.isValid(input.fieldId)) {
      throw new BadRequestException('Invalid fieldId');
    }

    const crop = await this.fieldModel.findById(input.fieldId);
    if (!crop) {
      throw new NotFoundException('Field not found');
    }

    const section = await this.sectorModel.findById(input.sectorId);
    if (!section) {
      throw new NotFoundException('Sector not found');
    }
    const record = await this.ndviModel.create({
      ...input,
      recordedAt: new Date(input.recordedAt),
      sectorId: new Types.ObjectId(input.sectorId),
      fieldId: new Types.ObjectId(input.fieldId),
    });

    await this.sectorModel.findByIdAndUpdate(input.sectorId, {
      ndviValue: input.ndviValue,
    });

    this.logger.log(
      `NDVI recorded | sector=${input.sectorId} | value=${input.ndviValue}`,
    );

    return {
      _id: String(record._id),
      ndviValue: record.ndviValue,
      healthIndex: record.healthIndex,
      soilMoisture: record.soilMoisture,
      recordedAt: record.recordedAt,
      sectorId: input.sectorId,
      fieldId: input.fieldId,
    };
  }

  public async getSectorTrend(
    sectorId: string,
    from?: Date,
    to?: Date,
  ): Promise<SectorNdviTrend> {
    const sector = await this.sectorModel.findById(sectorId).exec();
    if (!sector) throw new NotFoundException('Sector not found.');

    const resolvedFrom = from ?? this.daysAgo(30);
    const resolvedTo = to ?? new Date();

    const records = await this.ndviModel
      .find({
        sectorId: new Types.ObjectId(sectorId),
        recordedAt: { $gte: resolvedFrom, $lte: resolvedTo },
      })
      .sort({ recordedAt: 1 })
      .exec();

    const values = records.map((r) => r.ndviValue);
    const current = values.at(-1) ?? 0;
    const first = values.at(0) ?? 0;
    const avg = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
    const changePercent =
      first > 0 ? Math.round(((current - first) / first) * 100 * 100) / 100 : 0;

    return {
      sectorId,
      sectorName: sector.sectorName,
      currentNdvi: current,
      averageNdvi: Math.round(avg * 100) / 100,
      changePercent,
      trend: records.map((r) => ({
        date: r.recordedAt,
        ndviValue: r.ndviValue,
        healthIndex: r.healthIndex,
      })),
    };
  }

  public async getFieldNdviHistory(
    fieldId: string,
    from?: Date,
    to?: Date,
  ): Promise<NdviRecord[]> {
    const resolvedFrom = from ?? this.daysAgo(30);
    const resolvedTo = to ?? new Date();

    const records = await this.ndviModel
      .find({
        fieldId: new Types.ObjectId(fieldId),
        recordedAt: { $gte: resolvedFrom, $lte: resolvedTo },
      })
      .sort({ recordedAt: -1 })
      .exec();

    return records.map((r) => ({
      _id: String(r._id),
      ndviValue: r.ndviValue,
      healthIndex: r.healthIndex,
      soilMoisture: r.soilMoisture,
      recordedAt: r.recordedAt,
      sectorId: String(r.sectorId),
      fieldId: String(r.fieldId),
    }));
  }

  private daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }
}
