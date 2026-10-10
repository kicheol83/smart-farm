import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateFieldInput,
  UpdateFieldInput,
} from '../../libs/dto/farm-context-dto/fields/field';
import { Message } from '../../libs/types/common';
import { Crops } from '../../libs/dto/farm-context-dto/crops/crops';
import { Section } from '../../libs/dto/farm-context-dto/sections/sections';

export interface IField extends Document {
  _id: Types.ObjectId;
  fieldsArea: number;
  cropsId: Types.ObjectId;
  sectionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FieldsService {
  private readonly logger = new Logger(FieldsService.name);

  constructor(
    @InjectModel('fields')
    private fieldModel: Model<IField>,

    @InjectModel('sections')
    private sectionModel: Model<Section>,

    @InjectModel('crops')
    private cropModel: Model<Crops>,
  ) {}

  public async create(input: CreateFieldInput): Promise<IField> {
    if (!Types.ObjectId.isValid(input.cropsId)) {
      throw new BadRequestException('Invalid cropsId');
    }

    if (!Types.ObjectId.isValid(input.sectionId)) {
      throw new BadRequestException('Invalid sectionId');
    }

    const crop = await this.cropModel.findById(input.cropsId);
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const section = await this.sectionModel.findById(input.sectionId);
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const result = await this.fieldModel.create({
      ...input,

      cropsId: new Types.ObjectId(input.cropsId),

      sectionId: new Types.ObjectId(input.sectionId),
    });

    this.logger.log(
      `Field created | id=${result._id} | area=${result.fieldsArea}`,
    );

    return result;
  }

  public async findAll(sectionIds?: Types.ObjectId[]): Promise<IField[]> {
    return this.fieldModel
      .find(sectionIds ? { sectionId: { $in: sectionIds } } : {})
      .populate('cropsId')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findOne(id: string): Promise<IField> {
    const result = await this.fieldModel
      .findById(id)
      .populate('cropsId')
      .exec();
    if (!result) throw new NotFoundException(Message.NO_FIELD_FOUND);
    return result;
  }

  public async findByCrop(
    cropsId: string,
    sectionIds?: Types.ObjectId[],
  ): Promise<IField[]> {
    return this.fieldModel
      .find({
        cropsId: new Types.ObjectId(cropsId),
        ...(sectionIds ? { sectionId: { $in: sectionIds } } : {}),
      })
      .exec();
  }

  public async update(id: string, input: UpdateFieldInput): Promise<IField> {
    const updateData: any = { ...input };
    if (input.cropsId) updateData.cropsId = new Types.ObjectId(input.cropsId);
    if (input.sectionId)
      updateData.sectionId = new Types.ObjectId(input.sectionId);

    const result = await this.fieldModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!result) throw new NotFoundException(Message.NO_FIELD_FOUND);
    return result;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.fieldModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException(Message.NO_FIELD_FOUND);
    return true;
  }
}
