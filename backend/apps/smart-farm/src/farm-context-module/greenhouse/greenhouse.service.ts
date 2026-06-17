import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { CreateGreenhouseInput, UpdateGreenhouseInput } from '../../libs/dto/farm-context-dto/greenhouse/greenhouse';
import { Message } from '../../libs/types/common';

export interface IGreenhouse extends Document {
  _id: Types.ObjectId;
  greenHouseName: string;
  greenHouseType: string;
  greenHouseSize: number;
  farmsId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GreenhouseService {
  private readonly logger = new Logger(GreenhouseService.name);

  constructor(
    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,
  ) {}

  public async create(input: CreateGreenhouseInput): Promise<IGreenhouse> {
    const result = await this.greenhouseModel.create({
      ...input,
      farmsId: new Types.ObjectId(input.farmsId),
    });
    this.logger.log(`Greenhouse created | ${result.greenHouseName}`);
    return result;
  }

  public async findByFarm(farmsId: string): Promise<IGreenhouse[]> {
    return this.greenhouseModel
      .find({ farmsId: new Types.ObjectId(farmsId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findOne(id: string): Promise<IGreenhouse> {
    const result = await this.greenhouseModel.findById(id).exec();
    if (!result) throw new NotFoundException(Message.GREENHOUSE_NOT_FOUND);
    return result;
  }

  public async update(id: string, input: UpdateGreenhouseInput): Promise<IGreenhouse> {
    await this.greenhouseModel.findByIdAndUpdate(id, input, { new: true }).exec();
    const result = await this.greenhouseModel.findById(id).exec();
    if (!result) throw new NotFoundException(Message.GREENHOUSE_NOT_FOUND);
    return result;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.greenhouseModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException(Message.GREENHOUSE_NOT_FOUND);
    return true;
  }
}
