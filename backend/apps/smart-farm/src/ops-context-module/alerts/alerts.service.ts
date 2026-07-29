import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateAlertInput,
  GetAlertNotificationsInput,
  CheckSensorThresholdInput,
  AlertsActualValues,
  AlertSeverity,
  PaginatedAlertNotifications,
  ActiveAlertsSummary,
} from '../../libs/dto/ops-context-dto/alerts/alert';
import { Greenhouse } from '../../libs/dto/farm-context-dto/greenhouse/greenhouse';
import { ISection } from '../../farm-context-module/sections/sections.service';

export interface IAlert extends Document {
  _id: Types.ObjectId;
  alertsType: string;
  alertsThreshold: number;
  alertsActualValues: string;
  alertsSeverity: string;
  sensorsId?: Types.ObjectId;
  sectionId?: Types.ObjectId;
  deviceId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlertNotification extends Document {
  _id: Types.ObjectId;
  message: string;
  isRead: boolean;
  memberId: Types.ObjectId;
  alertsId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  sensorsUnit: string;
  deviceId: Types.ObjectId;
}

interface IDevice extends Document {
  _id: Types.ObjectId;
  greenHouseId: Types.ObjectId;
}

interface IGreenhouse extends Document {
  _id: Types.ObjectId;
  farmsId: Types.ObjectId;
}

interface IFarm extends Document {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel('alerts')
    private readonly alertModel: Model<IAlert>,

    @InjectModel('alertNotifications')
    private readonly notificationModel: Model<IAlertNotification>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,

    @InjectModel('farms')
    private readonly farmModel: Model<IFarm>,

    @InjectModel('sections')
    private readonly sectionModel: Model<ISection>,
  ) {}

  public async create(input: CreateAlertInput): Promise<IAlert> {
    if (!Types.ObjectId.isValid(input.sensorsId)) {
      throw new BadRequestException('Invalid sensorsId');
    }

    const sensor = await this.sensorModel.findById(input.sensorsId);
    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }

    const alert = await this.alertModel.create({
      ...input,
      sensorsId: new Types.ObjectId(input.sensorsId),
    });
    this.logger.log(
      `Alert created | type=${alert.alertsType} | severity=${alert.alertsSeverity}`,
    );
    return alert;
  }

  async createPlantHealthAlert(
    sectionId: string,
    severity: AlertSeverity,
    description: string,
    healthIndex: number,
  ): Promise<IAlert> {
    return this.create({
      alertsType: 'PLANT_HEALTH',
      alertsThreshold: 50,
      alertsActualValues:
        healthIndex < 50 ? AlertsActualValues.LOW : AlertsActualValues.NORMAL,
      alertsSeverity: severity,
      sectionId,
    } as any).then((alert) => {
      this.logger.log(
        `Plant health alert | section=${sectionId} | ${description}`,
      );
      return alert;
    });
  }

  async createSystemAlert(
    deviceId: string,
    severity: AlertSeverity,
    description: string,
  ): Promise<IAlert> {
    return this.create({
      alertsType: 'SYSTEM_SENSOR',
      alertsThreshold: 0,
      alertsActualValues: AlertsActualValues.HIGH,
      alertsSeverity: severity,
      deviceId,
    } as any).then((alert) => {
      this.logger.log(`System alert | device=${deviceId} | ${description}`);
      return alert;
    });
  }

  public async findBySensor(sensorsId: string): Promise<IAlert[]> {
    return this.alertModel
      .find({ sensorsId: new Types.ObjectId(sensorsId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findOne(id: string): Promise<IAlert> {
    const alert = await this.alertModel.findById(id).exec();
    if (!alert) throw new NotFoundException('Alert not found.');
    return alert;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.alertModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Alert not found.');
    return true;
  }

  public async checkThreshold(
    input: CheckSensorThresholdInput,
  ): Promise<IAlert | null> {
    const alertConfigs = await this.alertModel
      .find({ sensorsId: new Types.ObjectId(input.sensorsId) })
      .exec();

    for (const config of alertConfigs) {
      const breached = this.isThresholdBreached(
        input.currentValue,
        config.alertsThreshold,
        config.alertsActualValues as AlertsActualValues,
      );

      if (breached) {
        await this.createNotificationForAlert(config, input.currentValue);
        this.logger.log(
          `Threshold breached | sensor=${input.sensorsId} | value=${input.currentValue} | threshold=${config.alertsThreshold}`,
        );
        return config;
      }
    }

    return null;
  }

  private async createNotificationForAlert(
    alert: IAlert,
    actualValue: number,
  ): Promise<void> {
    const sensor = await this.sensorModel.findById(alert.sensorsId).exec();
    if (!sensor) return;

    const device = await this.deviceModel.findById(sensor.deviceId).exec();
    if (!device) return;

    const greenhouse: any = await this.greenhouseModel
      .findById(device.greenHouseId)
      .exec();
    if (!greenhouse) return;

    const farm = await this.farmModel.findById(greenhouse.farmsId).exec();
    if (!farm) return;

    const message = this.buildAlertMessage(
      alert,
      sensor.sensorType,
      actualValue,
    );

    await this.notificationModel.create({
      message,
      isRead: false,
      memberId: farm.memberId,
      alertsId: alert._id,
    });
  }

  public async findNotifications(
    memberId: Types.ObjectId,
    input: GetAlertNotificationsInput,
  ): Promise<PaginatedAlertNotifications> {
    const query: any = { memberId };
    if (input.unreadOnly) query.isRead = false;

    const limit = input.limit ?? 20;
    const page = input.page ?? 1;
    const skip = (page - 1) * limit;

    let notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    let items = await this.attachAlerts(notifications);

    if (input.severity) {
      items = items.filter((n) => n.alert?.alertsSeverity === input.severity);
    }

    const total = await this.notificationModel.countDocuments(query);
    const unreadCount = await this.notificationModel.countDocuments({
      memberId,
      isRead: false,
    });

    return {
      items: items as any,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async markAsRead(
    id: string,
    memberId: Types.ObjectId,
  ): Promise<IAlertNotification> {
    const notification = await this.notificationModel
      .findOneAndUpdate({ _id: id, memberId }, { isRead: true }, { new: true })
      .exec();
    if (!notification) throw new NotFoundException('Notification not found.');
    return notification;
  }

  async markAllAsRead(memberId: Types.ObjectId): Promise<number> {
    const result = await this.notificationModel.updateMany(
      { memberId, isRead: false },
      { isRead: true },
    );
    return result.modifiedCount;
  }

  async getActiveAlertsSummary(
    greenHouseId: string,
  ): Promise<ActiveAlertsSummary> {
    const ghObjectId = new Types.ObjectId(greenHouseId);

    const devices = await this.deviceModel
      .find({ greenHouseId: ghObjectId })
      .select('_id')
      .exec();
    const deviceIds = devices.map((d) => d._id);

    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds } })
      .select('_id')
      .exec();
    const sensorIds = sensors.map((s) => s._id);

    const sections = await this.sectionModel
      .find({ greenHouseId: ghObjectId })
      .select('_id')
      .exec();
    const sectionIds = sections.map((s) => s._id);

    const alerts = await this.alertModel
      .find({
        $or: [
          { sensorsId: { $in: sensorIds } },
          { sectionId: { $in: sectionIds } },
          { deviceId: { $in: deviceIds } },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      total: alerts.length,
      critical: alerts.filter(
        (a) => a.alertsSeverity === AlertSeverity.CRITICAL,
      ).length,
      warning: alerts.filter((a) => a.alertsSeverity === AlertSeverity.WARNING)
        .length,
      info: alerts.filter((a) => a.alertsSeverity === AlertSeverity.INFO)
        .length,
      recentAlerts: alerts.slice(0, 10) as any,
    };
  }

  private isThresholdBreached(
    currentValue: number,
    threshold: number,
    actualValues: AlertsActualValues,
  ): boolean {
    switch (actualValues) {
      case AlertsActualValues.HIGH:
        return currentValue > threshold;
      case AlertsActualValues.LOW:
        return currentValue < threshold;
      default:
        return false;
    }
  }

  private buildAlertMessage(
    alert: IAlert,
    sensorType: string,
    actualValue: number,
  ): string {
    const direction =
      alert.alertsActualValues === AlertsActualValues.HIGH ? 'above' : 'below';
    return `${sensorType} is ${direction} threshold: ${actualValue} (limit: ${alert.alertsThreshold})`;
  }

  private async attachAlerts(
    notifications: IAlertNotification[],
  ): Promise<(IAlertNotification & { alert?: IAlert })[]> {
    const alertIds = notifications.map((n) => n.alertsId);
    const alerts = await this.alertModel
      .find({ _id: { $in: alertIds } })
      .exec();
    const alertMap = new Map(alerts.map((a) => [String(a._id), a]));

    return notifications.map((n) => ({
      ...(n.toObject() as any),
      _id: String(n._id),
      alertsId: String(n.alertsId),
      memberId: String(n.memberId),
      alert: alertMap.get(String(n.alertsId)),
    }));
  }
}
