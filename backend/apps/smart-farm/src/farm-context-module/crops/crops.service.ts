import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateCropsInput,
  UpdateCropsInput,
} from '../../libs/dto/farm-context-dto/crops/crops';
import { Message } from '../../libs/types/common';

export interface ICrops extends Document {
  _id: Types.ObjectId;
  cropsName: string;
  cropsOptionalTemps: number;
  cropsOptionalMoistures: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CropsService {
  private readonly logger = new Logger(CropsService.name);

  constructor(
    @InjectModel('crops')
    private readonly cropsModel: Model<ICrops>,
  ) {}

  public async create(input: CreateCropsInput): Promise<ICrops> {
    const result = await this.cropsModel.create(input);
    this.logger.log(`Crop created | ${result.cropsName}`);
    return result;
  }

  public async findAll(): Promise<ICrops[]> {
    return this.cropsModel.find().sort({ cropsName: 1 }).exec();
  }

  public async findOne(id: string): Promise<ICrops> {
    const result = await this.cropsModel.findById(id).exec();
    if (!result) throw new NotFoundException(Message.CROP_NOT_FOUND);
    return result;
  }

  public async update(id: string, input: UpdateCropsInput): Promise<ICrops> {
    const result = await this.cropsModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!result) throw new NotFoundException(Message.CROP_NOT_FOUND);
    return result;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.cropsModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException(Message.CROP_NOT_FOUND);
    return true;
  }
}
