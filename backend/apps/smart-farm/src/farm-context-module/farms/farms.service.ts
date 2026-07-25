import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateFarmInput,
  UpdateFarmInput,
} from '../../libs/dto/farm-context-dto/farms/farm';
import { Member } from '../../libs/dto/account-context-dto/member/member';

export interface IFarm extends Document {
  _id: Types.ObjectId;
  farmName: string;
  farmLocation: string;
  farmDescription?: string;
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

    @InjectModel('members')
    private readonly memberModel: Model<Member>,
  ) {}

  async create(
    memberId: Types.ObjectId,
    input: CreateFarmInput,
  ): Promise<IFarm> {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid memberId');
    }

    const member = await this.memberModel.findById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    const farm = await this.farmModel.create({ ...input, memberId });
    this.logger.log(`Farm created | ${farm.farmName} | memberId=${memberId}`);
    return farm;
  }

  async findAll(memberId: Types.ObjectId): Promise<IFarm[]> {
    return this.farmModel.find({ memberId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(farmId: string, memberId: Types.ObjectId): Promise<IFarm> {
    const farm = await this.farmModel
      .findOne({ _id: new Types.ObjectId(farmId), memberId })
      .exec();
    if (!farm) throw new NotFoundException('Farm not found.');
    return farm;
  }

  async update(
    farmId: string,
    memberId: Types.ObjectId,
    input: UpdateFarmInput,
  ): Promise<IFarm> {
    const farm = await this.farmModel
      .findOneAndUpdate({ _id: new Types.ObjectId(farmId), memberId }, input, {
        new: true,
      })
      .exec();
    if (!farm) throw new NotFoundException('Farm not found.');
    return farm;
  }

  async remove(farmId: string, memberId: Types.ObjectId): Promise<boolean> {
    const result = await this.farmModel
      .deleteOne({ _id: new Types.ObjectId(farmId), memberId })
      .exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Farm not found.');
    return true;
  }
}
