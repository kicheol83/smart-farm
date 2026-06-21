import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { CreatePlantHealthInput } from '../../libs/dto/farm-context-dto/plant-health/plant-health';

export interface IPlantHealth extends Document {
  _id: Types.ObjectId;
  plantHealthIndex: number;
  plantValue: number;
  recordeAt: Date;
  fieldsId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PlanHealthService {
  private readonly logger = new Logger(PlanHealthService.name);

  constructor(
    @InjectModel('plantHealth')
    private readonly plantHealthModel: Model<IPlantHealth>,
  ) {}

  public async create(input: CreatePlantHealthInput): Promise<IPlantHealth> {
    const result = await this.plantHealthModel.create({
      ...input,
      recordeAt: new Date(input.recordeAt),
      fieldsId: new Types.ObjectId(input.fieldsId),
    });
    this.logger.log(
      `PlantHealth recorded | index=${result.plantHealthIndex} | field=${input.fieldsId}`,
    );
    return result;
  }

  public async findByField(
    fieldsId: string,
    limit = 50,
  ): Promise<IPlantHealth[]> {
    const result = await this.plantHealthModel
      .find({ fieldsId: new Types.ObjectId(fieldsId) })
      .sort({ recordeAt: -1 })
      .limit(limit)
      .exec();
    return result;
  }

  public async findByDateRange(
    fieldsId: string,
    from: Date,
    to: Date,
  ): Promise<IPlantHealth[]> {
    const result = await this.plantHealthModel
      .find({
        fieldsId: new Types.ObjectId(fieldsId),
        recordeAt: { $gte: from, $lte: to },
      })
      .sort({ recordeAt: 1 })
      .exec();
    return result;
  }

  public async findLatest(fieldsId: string): Promise<IPlantHealth | null> {
    const result = await this.plantHealthModel
      .findOne({ fieldsId: new Types.ObjectId(fieldsId) })
      .sort({ recordeAt: -1 })
      .exec();
    return result;
  }
}
