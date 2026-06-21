import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { CreateWaterUsageInput } from '../../libs/dto/farm-context-dto/water-usage/water-usage';
import { Greenhouse } from '../../libs/dto/farm-context-dto/greenhouse/greenhouse';

export interface IWaterUsage extends Document {
  _id: Types.ObjectId;
  waterAmount: number;
  recordedAt: Date;
  greenHouseId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WaterUsageService {
  private readonly logger = new Logger(WaterUsageService.name);

  constructor(
    @InjectModel('waterUsages')
    private readonly waterUsageModel: Model<IWaterUsage>,

       @InjectModel('greenHouses')
    private readonly greenHouseModel: Model<Greenhouse>,
  ) {}

  public async create(input: CreateWaterUsageInput): Promise<IWaterUsage> {
    if (!Types.ObjectId.isValid(input.greenHouseId)) {
      throw new BadRequestException('Invalid greenHouseId');
    }
    const greenHouse = await this.greenHouseModel.findById(input.greenHouseId);
    if (!greenHouse) {
      throw new NotFoundException('Greenhouse not found');
    }

    const record = await this.waterUsageModel.create({
      ...input,
      recordedAt: new Date(input.recordedAt),
      greenHouseId: new Types.ObjectId(input.greenHouseId),
    });
    this.logger.log(
      `WaterUsage recorded | ${record.waterAmount}L | gh=${input.greenHouseId}`,
    );
    return record;
  }

  public async findByGreenhouse(
    greenHouseId: string,
    limit = 50,
  ): Promise<IWaterUsage[]> {
    return this.waterUsageModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .exec();
  }

  public async findByDateRange(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<IWaterUsage[]> {
    return this.waterUsageModel
      .find({
        greenHouseId: new Types.ObjectId(greenHouseId),
        recordedAt: { $gte: from, $lte: to },
      })
      .sort({ recordedAt: 1 })
      .exec();
  }
}
