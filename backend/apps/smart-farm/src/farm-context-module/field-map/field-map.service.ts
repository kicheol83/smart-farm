import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateFieldMapInput,
  UpdateFieldMapInput,
  CreateSectorInput,
  UpdateSectorInput,
  UpdateNdviInput,
  FieldMap,
  FieldMapAnalytics,
  FieldNdviMap,
  NdviLevel,
} from '../../libs/dto/farm-context-dto/fields/fields-map';
import { IFarm } from '../farms/farms.service';

export interface IFieldMap extends Document {
  _id: Types.ObjectId;
  fieldName: string;
  totalArea: number;
  boundaryCoordinates: { lat: number; lng: number }[];
  centerPoint: { lat: number; lng: number };
  farmId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMapSector extends Document {
  _id: Types.ObjectId;
  sectorName: string;
  sectorStatus: string;
  sectorArea: number;
  coordinates: { lat: number; lng: number }[];
  centerPoint: { lat: number; lng: number };
  ndviValue?: number;
  ndviLevel?: string;
  healthIndex?: number;
  fieldId: Types.ObjectId;
  cropsId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface INdviAnalytics extends Document {
  ndviValue: number;
  healthIndex?: number;
  soilMoisture?: number;
  recordedAt: Date;
  sectorId: Types.ObjectId;
  fieldId: Types.ObjectId;
}

@Injectable()
export class FieldMapService {
  private readonly logger = new Logger(FieldMapService.name);

  constructor(
    @InjectModel('fieldMaps')
    private readonly fieldMapModel: Model<IFieldMap>,

    @InjectModel('mapSectors')
    private readonly sectorModel: Model<IMapSector>,

    @InjectModel('ndviAnalytics')
    private readonly ndviModel: Model<INdviAnalytics>,

    @InjectModel('farm')
    private readonly farmModel: Model<IFarm>,
  ) {}

  async createFieldMap(input: CreateFieldMapInput): Promise<IFieldMap> {
    if (!Types.ObjectId.isValid(input.farmId)) {
      throw new BadRequestException('Invalid farmId');
    }

    const farm = await this.farmModel.findById(input.farmId);
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const result = await this.fieldMapModel.create({
      ...input,
      farmId: new Types.ObjectId(input.farmId),
    });
    this.logger.log(`FieldMap created | ${result.fieldName}`);
    return result;
  }

  async findFieldMapsByFarm(farmId: string): Promise<IFieldMap[]> {
    return this.fieldMapModel
      .find({ farmId: new Types.ObjectId(farmId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findFieldMapById(id: string): Promise<IFieldMap> {
    const result = await this.fieldMapModel.findById(id).exec();
    if (!result) throw new NotFoundException('FieldMap not found.');
    return result;
  }

  async updateFieldMap(
    id: string,
    input: UpdateFieldMapInput,
  ): Promise<IFieldMap> {
    const result = await this.fieldMapModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!result) throw new NotFoundException('FieldMap not found.');
    return result;
  }

  public async removeFieldMap(id: string): Promise<boolean> {
    const result = await this.fieldMapModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('FieldMap not found.');
    await this.sectorModel.deleteMany({ fieldId: new Types.ObjectId(id) });
    return true;
  }

  public async createSector(input: CreateSectorInput): Promise<IMapSector> {
    const sector = await this.sectorModel.create({
      ...input,
      fieldId: new Types.ObjectId(input.fieldId),
      cropsId: input.cropsId ? new Types.ObjectId(input.cropsId) : null,
    });
    this.logger.log(
      `Sector created | ${sector.sectorName} | field=${input.fieldId}`,
    );
    return sector;
  }

  public async findSectorsByField(fieldId: string): Promise<IMapSector[]> {
    return this.sectorModel
      .find({ fieldId: new Types.ObjectId(fieldId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  public async findSectorById(id: string): Promise<IMapSector> {
    const sector = await this.sectorModel.findById(id).exec();
    if (!sector) throw new NotFoundException('Sector not found.');
    return sector;
  }

  public async updateSector(
    id: string,
    input: UpdateSectorInput,
  ): Promise<IMapSector> {
    const updateData: any = { ...input };
    if (input.cropsId) updateData.cropsId = new Types.ObjectId(input.cropsId);

    const sector = await this.sectorModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!sector) throw new NotFoundException('Sector not found.');
    return sector;
  }

  public async removeSector(id: string): Promise<boolean> {
    const result = await this.sectorModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Sector not found.');
    return true;
  }

  public async updateSectorNdvi(input: UpdateNdviInput): Promise<IMapSector> {
    const ndviLevel = this.resolveNdviLevel(input.ndviValue);

    const sector = await this.sectorModel
      .findByIdAndUpdate(
        input.sectorId,
        { ndviValue: input.ndviValue, ndviLevel },
        { new: true },
      )
      .exec();
    if (!sector) throw new NotFoundException('Sector not found.');

    this.logger.log(
      `NDVI updated | sector=${input.sectorId} | value=${input.ndviValue} | level=${ndviLevel}`,
    );
    return sector;
  }

  public async getFieldMapWithSectors(fieldId: string): Promise<FieldMap> {
    const result = await this.fieldMapModel.findById(fieldId).exec();
    if (!result) throw new NotFoundException('FieldMap not found.');

    const sectors = await this.sectorModel
      .find({ fieldId: new Types.ObjectId(fieldId) })
      .exec();

    return {
      _id: String(result._id),
      fieldName: result.fieldName,
      totalArea: result.totalArea,
      boundaryCoordinates: result.boundaryCoordinates,
      centerPoint: result.centerPoint,
      sectors: sectors as any,
      farmId: String(result.farmId),
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  public async getFieldNdviMap(fieldId: string): Promise<FieldNdviMap> {
    const result = await this.fieldMapModel.findById(fieldId).exec();
    if (!result) throw new NotFoundException('FieldMap not found.');

    const sectors = await this.sectorModel
      .find({ fieldId: new Types.ObjectId(fieldId) })
      .exec();

    const ndviSectors = sectors.map((s) => ({
      sectorId: String(s._id),
      sectorName: s.sectorName,
      ndviValue: s.ndviValue ?? 0,
      ndviLevel: (s.ndviLevel as NdviLevel) ?? NdviLevel.LOW,
      centerPoint: s.centerPoint,
      coordinates: s.coordinates,
      colorCode: this.getNdviColor(s.ndviValue ?? 0),
    }));

    const avgNdvi = sectors.length
      ? sectors.reduce((s, sec) => s + (sec.ndviValue ?? 0), 0) / sectors.length
      : 0;

    const lastUpdated = sectors.reduce(
      (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
      new Date(0),
    );

    return {
      fieldId,
      fieldName: result.fieldName,
      averageNdvi: Math.round(avgNdvi * 100) / 100,
      lastUpdated,
      sectors: ndviSectors,
    };
  }

  public async getFieldAnalytics(
    fieldId: string,
    from?: Date,
    to?: Date,
  ): Promise<FieldMapAnalytics> {
    const result = await this.fieldMapModel.findById(fieldId).exec();
    if (!result) throw new NotFoundException('FieldMap not found.');

    const sectors = await this.sectorModel
      .find({ fieldId: new Types.ObjectId(fieldId) })
      .exec();

    const resolvedFrom = from ?? this.daysAgo(30);
    const resolvedTo = to ?? new Date();

    const history = await this.ndviModel.aggregate([
      {
        $match: {
          fieldId: new Types.ObjectId(fieldId),
          recordedAt: { $gte: resolvedFrom, $lte: resolvedTo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$recordedAt' } },
          ndviValue: { $avg: '$ndviValue' },
          healthIndex: { $avg: '$healthIndex' },
          soilMoisture: { $avg: '$soilMoisture' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const avgNdvi = sectors.length
      ? sectors.reduce((s, sec) => s + (sec.ndviValue ?? 0), 0) / sectors.length
      : 0;

    const avgHealth = sectors.length
      ? sectors.reduce((s, sec) => s + (sec.healthIndex ?? 0), 0) /
        sectors.length
      : 0;

    return {
      fieldId,
      fieldName: result.fieldName,
      avgNdvi: Math.round(avgNdvi * 100) / 100,
      avgHealthIndex: Math.round(avgHealth * 10) / 10,
      totalSectors: sectors.length,
      activeSectors: sectors.filter((s) => s.sectorStatus === 'ACTIVE').length,
      analyticsHistory: history.map((h) => ({
        date: new Date(h._id),
        ndviValue: Math.round(h.ndviValue * 100) / 100,
        healthIndex: h.healthIndex
          ? Math.round(h.healthIndex * 10) / 10
          : undefined,
        soilMoisture: h.soilMoisture,
      })),
    };
  }

  private resolveNdviLevel(value: number): NdviLevel {
    if (value >= 0.8) return NdviLevel.VERY_HIGH;
    if (value >= 0.6) return NdviLevel.HIGH;
    if (value >= 0.4) return NdviLevel.MODERATE;
    if (value >= 0.2) return NdviLevel.LOW;
    return NdviLevel.VERY_LOW;
  }

  private getNdviColor(value: number): string {
    if (value >= 0.8) return '#1a7a1a'; // to'q yashil
    if (value >= 0.6) return '#4caf50'; // yashil
    if (value >= 0.4) return '#8bc34a'; // och yashil
    if (value >= 0.2) return '#ffeb3b'; // sariq
    return '#f44336'; // qizil
  }

  private daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }
}
