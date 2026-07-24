import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateActionLogData,
  GetActionLogsInput,
  PaginatedActionLogs,
} from '../../libs/dto/iot-context-dto/action-log/action-log';

export interface IActionLog extends Document {
  _id: Types.ObjectId;
  actionType: string;
  actionResource: string;
  description: string;
  resourceId?: string;
  memberId: Types.ObjectId;
  memberFullName: string;
  device?: string;
  ipAddress?: string;
  actionCode?: string;
  createdAt: Date;
}

@Injectable()
export class ActionLogService {
  private readonly logger = new Logger(ActionLogService.name);

  constructor(
    @InjectModel('actionLogs')
    private readonly actionLogModel: Model<IActionLog>,
  ) {}

  async log(data: CreateActionLogData): Promise<void> {
    await this.actionLogModel.create({
      ...data,
      memberId: new Types.ObjectId(data.memberId),
    });
  }

  /**
   * Figma: Settings / User Actions Log sahifasi
   * Pagination + filter bilan
   */
  async findAll(
    memberId: Types.ObjectId,
    input: GetActionLogsInput,
  ): Promise<PaginatedActionLogs> {
    const query: any = { memberId };

    if (input.actionType) query.actionType = input.actionType;
    if (input.actionResource) query.actionResource = input.actionResource;
    if (input.from || input.to) {
      query.createdAt = {};
      if (input.from) query.createdAt.$gte = new Date(input.from);
      if (input.to) query.createdAt.$lte = new Date(input.to);
    }

    const limit = input.limit ?? 20;
    const page = input.page ?? 1;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.actionLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.actionLogModel.countDocuments(query),
    ]);

    return {
      items: items as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllMembers(
    input: GetActionLogsInput,
  ): Promise<PaginatedActionLogs> {
    const query: any = {};

    if (input.actionType) query.actionType = input.actionType;
    if (input.actionResource) query.actionResource = input.actionResource;
    if (input.from || input.to) {
      query.createdAt = {};
      if (input.from) query.createdAt.$gte = new Date(input.from);
      if (input.to) query.createdAt.$lte = new Date(input.to);
    }

    const limit = input.limit ?? 20;
    const page = input.page ?? 1;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.actionLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.actionLogModel.countDocuments(query),
    ]);

    return {
      items: items as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
