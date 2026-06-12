import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateFarmInput,
  UpdateFarmInput,
} from '../../libs/dto/farm-context-dto/farms/farm';
import { MESSAGES } from '@nestjs/core/constants';
import { Message } from '../../libs/types/common';

export interface IFarm extends Document {
  _id: Types.ObjectId;
  farmName: string;
  farmLocation: string;
  memberId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FarmsService {
  private readonly logger = new Logger(FarmsService.name);

  constructor(
    @InjectModel('farms')
    private readonly farmModel: Model<IFarm>,
  ) {}

  public async create(
    memberId: Types.ObjectId,
    input: CreateFarmInput,
  ): Promise<IFarm> {
    console.log('memberId:', memberId);

    const result = await this.farmModel.create({ ...input, memberId });
    this.logger.log(`Farm created | ${result.farmName} | memberId=${memberId}`);
    console.log('Created Farm:', result);
    return result;
  }

  public async findAll(memberId: Types.ObjectId): Promise<IFarm[]> {
    const result = await this.farmModel
      .find({ memberId })
      .sort({ createdAt: -1 })
      .exec();
    return result;
  }

  public async findOne(
    farmId: string,
    memberId: Types.ObjectId,
  ): Promise<IFarm> {
    const result = await this.farmModel
      .findOne({ _id: new Types.ObjectId(farmId), memberId })
      .exec();
    if (!result) throw new NotFoundException(Message.NO_FARM_FOUND);
    return result;
  }

  public async update(
    farmId: string,
    memberId: Types.ObjectId,
    input: UpdateFarmInput,
  ): Promise<IFarm> {
    const result = await this.farmModel
      .findOneAndUpdate({ _id: new Types.ObjectId(farmId), memberId }, input, {
        new: true,
      })
      .exec();
    console.log('Updated Farm:', result);
    if (!result) throw new NotFoundException(Message.NO_FARM_FOUND);
    return result;
  }

  public async remove(
    farmId: string,
    memberId: Types.ObjectId,
  ): Promise<boolean> {
    const result = await this.farmModel
      .deleteOne({ _id: new Types.ObjectId(farmId), memberId })
      .exec();
    if (result.deletedCount === 0)
      throw new NotFoundException(Message.NO_FARM_FOUND);
    return true;
  }
}
