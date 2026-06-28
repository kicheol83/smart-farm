import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  GlobalStats,
  MemberGrowthTrend,
  PaginatedAdminMembers,
  AdminMemberView,
  PaginatedDeviceHealth,
  DeviceHealthOverview,
  SystemAlertOverview,
  GetAdminMembersInput,
  UpdateMemberRoleInput,
  UpdateMemberStatusInput,
  GetGrowthTrendInput,
  GetDeviceHealthInput,
} from '../libs/dto/admin-dtos/admin';

interface IMember extends Document {
  _id: Types.ObjectId;
  memberFullName: string;
  memberEmail: string;
  memberRole: string;
  memberStatus: string;
  memberAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IFarm extends Document {
  _id: Types.ObjectId;
  farmName: string;
  memberId: Types.ObjectId;
}

interface IGreenhouse extends Document {
  _id: Types.ObjectId;
  greenHouseName: string;
  farmsId: Types.ObjectId;
}

interface IDevice extends Document {
  _id: Types.ObjectId;
  deviceName: string;
  deviceType: string;
  deviceStatus: string;
  installedAt: Date;
  greenHouseId: Types.ObjectId;
  updatedAt: Date;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
}

interface IAlertNotification extends Document {
  alertsId: Types.ObjectId;
  memberId: Types.ObjectId;
  createdAt: Date;
}

interface IAlert extends Document {
  _id: Types.ObjectId;
  alertsType: string;
  alertsSeverity: string;
  alertsThreshold: number;
  sensorsId: Types.ObjectId;
  createdAt: Date;
}

interface ITask extends Document {
  taskStatus: string;
  dueDate: Date;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel('Member')
    private readonly memberModel: Model<IMember>,

    @InjectModel('farms')
    private readonly farmModel: Model<IFarm>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('alertNotifications')
    private readonly alertNotificationModel: Model<IAlertNotification>,

    @InjectModel('alerts')
    private readonly alertModel: Model<IAlert>,

    @InjectModel('tasks')
    private readonly taskModel: Model<ITask>,
  ) {}

  public async getGlobalStats(): Promise<GlobalStats> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(yesterday.getHours() - 24);

    const [
      totalMembers,
      activeMembers,
      totalFarms,
      totalGreenhouses,
      totalDevices,
      onlineDevices,
      offlineDevices,
      totalSensors,
      alertsLast24h,
      criticalAlertsCount,
      totalTasks,
      completedTasks,
      overdueTasks,
    ] = await Promise.all([
      this.memberModel.countDocuments(),
      this.memberModel.countDocuments({ memberStatus: 'ACTIVE' }),
      this.farmModel.countDocuments(),
      this.greenhouseModel.countDocuments(),
      this.deviceModel.countDocuments(),
      this.deviceModel.countDocuments({ deviceStatus: 'ONLINE' }),
      this.deviceModel.countDocuments({ deviceStatus: 'OFFLINE' }),
      this.sensorModel.countDocuments(),
      this.alertNotificationModel.countDocuments({
        createdAt: { $gte: yesterday },
      }),
      this.alertModel.countDocuments({ alertsSeverity: 'CRITICAL' }),
      this.taskModel.countDocuments(),
      this.taskModel.countDocuments({ taskStatus: 'DONE' }),
      this.taskModel.countDocuments({
        taskStatus: { $ne: 'DONE' },
        dueDate: { $lt: now },
      }),
    ]);

    return {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      totalFarms,
      totalGreenhouses,
      totalDevices,
      onlineDevices,
      offlineDevices,
      totalSensors,
      alertsLast24h,
      criticalAlertsCount,
      totalTasks,
      completedTasks,
      overdueTasks,
    };
  }

  public async getMemberGrowthTrend(
    input: GetGrowthTrendInput,
  ): Promise<MemberGrowthTrend> {
    const to = input.to ? new Date(input.to) : new Date();
    const from = input.from ? new Date(input.from) : this.daysAgo(30, to);

    const result = await this.memberModel.aggregate([
      {
        $match: { createdAt: { $gte: from, $lte: to } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const newRegistrations = result.reduce((s, r) => s + r.count, 0);

    const periodLen = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodLen);
    const prevCount = await this.memberModel.countDocuments({
      createdAt: { $gte: prevFrom, $lte: from },
    });

    const growthPercent =
      prevCount > 0
        ? Math.round(((newRegistrations - prevCount) / prevCount) * 100 * 10) /
          10
        : 0;

    return {
      newRegistrations,
      growthPercent,
      dataPoints: result.map((r) => ({
        date: new Date(r._id),
        count: r.count,
      })),
    };
  }

  public async getMembers(
    input: GetAdminMembersInput,
  ): Promise<PaginatedAdminMembers> {
    const query: any = {};

    if (input.search) {
      query.$or = [
        { memberFullName: { $regex: input.search, $options: 'i' } },
        { memberEmail: { $regex: input.search, $options: 'i' } },
      ];
    }
    if (input.memberRole) query.memberRole = input.memberRole;
    if (input.memberStatus) query.memberStatus = input.memberStatus;

    const limit = input.limit ?? 20;
    const page = input.page ?? 1;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.memberModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.memberModel.countDocuments(query),
    ]);

    const items: AdminMemberView[] = await Promise.all(
      members.map(async (m) => {
        const farmsCount = await this.farmModel.countDocuments({
          memberId: m._id,
        });
        return {
          _id: String(m._id),
          memberFullName: m.memberFullName,
          memberEmail: m.memberEmail,
          memberRole: m.memberRole as any,
          memberStatus: m.memberStatus as any,
          memberAvatar: m.memberAvatar,
          farmsCount,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        };
      }),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async getMemberDetail(memberId: string): Promise<AdminMemberView> {
    const member = await this.memberModel.findById(memberId).exec();
    if (!member) throw new NotFoundException('Member not found.');

    const farmsCount = await this.farmModel.countDocuments({
      memberId: member._id,
    });

    return {
      _id: String(member._id),
      memberFullName: member.memberFullName,
      memberEmail: member.memberEmail,
      memberRole: member.memberRole as any,
      memberStatus: member.memberStatus as any,
      memberAvatar: member.memberAvatar,
      farmsCount,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  public async updateMemberRole(
    input: UpdateMemberRoleInput,
  ): Promise<AdminMemberView> {
    const member = await this.memberModel
      .findByIdAndUpdate(
        input.memberId,
        { memberRole: input.memberRole },
        { new: true },
      )
      .exec();
    if (!member) throw new NotFoundException('Member not found.');

    this.logger.log(
      `Member role updated | ${member.memberEmail} → ${input.memberRole}`,
    );
    return this.getMemberDetail(input.memberId);
  }

  public async updateMemberStatus(
    input: UpdateMemberStatusInput,
  ): Promise<AdminMemberView> {
    const member = await this.memberModel
      .findByIdAndUpdate(
        input.memberId,
        { memberStatus: input.memberStatus },
        { new: true },
      )
      .exec();
    if (!member) throw new NotFoundException('Member not found.');

    if (input.memberStatus !== 'ACTIVE') {
      await this.memberModel.findByIdAndUpdate(input.memberId, {
        refreshToken: null,
      });
    }

    this.logger.log(
      `Member status updated | ${member.memberEmail} → ${input.memberStatus}`,
    );
    return this.getMemberDetail(input.memberId);
  }

  public async deleteMember(memberId: string): Promise<boolean> {
    const result = await this.memberModel.deleteOne({ _id: memberId }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Member not found.');
    this.logger.warn(`Member hard-deleted | id=${memberId}`);
    return true;
  }

  public async getDeviceHealthOverview(
    input: GetDeviceHealthInput,
  ): Promise<PaginatedDeviceHealth> {
    const query: any = {};
    if (input.deviceStatus) query.deviceStatus = input.deviceStatus;

    const limit = input.limit ?? 20;
    const page = input.page ?? 1;
    const skip = (page - 1) * limit;

    const [devices, total] = await Promise.all([
      this.deviceModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.deviceModel.countDocuments(query),
    ]);

    const items: DeviceHealthOverview[] = await Promise.all(
      devices.map(async (d) => {
        const greenhouse: any = await this.greenhouseModel
          .findById(d.greenHouseId)
          .exec();
        const farm: any = greenhouse
          ? await this.farmModel.findById(greenhouse.farmsId).exec()
          : null;
        const owner = farm
          ? await this.memberModel.findById(farm.memberId).exec()
          : null;

        return {
          deviceId: String(d._id),
          deviceName: d.deviceName,
          deviceStatus: d.deviceStatus,
          deviceType: d.deviceType,
          greenHouseName: greenhouse?.greenHouseName ?? 'Unknown',
          farmName: farm?.farmName ?? 'Unknown',
          ownerEmail: owner?.memberEmail ?? 'Unknown',
          installedAt: d.installedAt,
          updatedAt: d.updatedAt,
        };
      }),
    );

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async getSystemAlerts(limit = 50): Promise<SystemAlertOverview[]> {
    const alerts = await this.alertModel
      .find({ alertsSeverity: { $in: ['CRITICAL', 'WARNING'] } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    const result: SystemAlertOverview[] = [];

    for (const alert of alerts) {
      const sensor: any = await this.sensorModel
        .findById(alert.sensorsId)
        .exec();
      if (!sensor) continue;

      const device: any = await this.deviceModel
        .findById(sensor.deviceId)
        .exec();
      if (!device) continue;

      const greenhouse: any = await this.greenhouseModel
        .findById(device.greenHouseId)
        .exec();
      const farm: any = greenhouse
        ? await this.farmModel.findById(greenhouse.farmsId).exec()
        : null;
      const owner = farm
        ? await this.memberModel.findById(farm.memberId).exec()
        : null;

      result.push({
        alertId: String(alert._id),
        alertsType: alert.alertsType,
        alertsSeverity: alert.alertsSeverity,
        alertsThreshold: alert.alertsThreshold,
        ownerEmail: owner?.memberEmail ?? 'Unknown',
        greenHouseName: greenhouse?.greenHouseName ?? 'Unknown',
        createdAt: alert.createdAt,
      });
    }

    return result;
  }

  private daysAgo(days: number, from: Date): Date {
    const d = new Date(from);
    d.setDate(d.getDate() - days);
    return d;
  }
}
