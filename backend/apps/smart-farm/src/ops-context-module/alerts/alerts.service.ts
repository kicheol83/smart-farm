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

export interface IAlert extends Document {
  _id: Types.ObjectId;
  alertsType: string;
  alertsThreshold: number;
  alertsActualValues: string;
  alertsSeverity: string;
  sensorsId: Types.ObjectId;
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
      console.log({
        currentValue: input.currentValue,
        threshold: config.alertsThreshold,
        actual: config.alertsActualValues,
      });
      const breached = this.isThresholdBreached(
        input.currentValue,
        config.alertsThreshold,
        config.alertsActualValues as AlertsActualValues,
      );

      console.log('breached =', breached);

      if (breached) {
        await this.createNotificationForAlert(config, input.currentValue);
        this.logger.log(
          `Threshold breached | sensor=${input.sensorsId} | value=${input.currentValue} | threshold=${config.alertsThreshold}`,
        );
        console.log('notifications =>', config);
        return config;
      }
    }

    return null;
  }

  private async createNotificationForAlert(
    alert: IAlert,
    actualValue: number,
  ): Promise<void> {
    const sensor: ISensor = await this.sensorModel
      .findById(alert.sensorsId)
      .exec();
    console.log('Sensor:', sensor);
    if (!sensor) return;

    const device: IDevice = await this.deviceModel
      .findById(sensor.deviceId)
      .exec();
    console.log('Device:', device);
    if (!device) return;

    const greenhouse: IGreenhouse = await this.greenhouseModel
      .findById(device.greenHouseId)
      .exec();
    if (!greenhouse) return;

    const farm: IFarm = await this.farmModel
      .findById(greenhouse.farmsId)
      .exec();
    if (!farm) return;

    const message = this.buildAlertMessage(
      alert,
      sensor.sensorType,
      actualValue,
    );

    const notification = await this.notificationModel.create({
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

  public async getActiveAlertsSummary(
    greenHouseId: string,
  ): Promise<ActiveAlertsSummary> {
    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .select('_id')
      .exec();
    const deviceIds = devices.map((d) => d._id);

    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds } })
      .select('_id')
      .exec();
    const sensorIds = sensors.map((s) => s._id);

    const alerts = await this.alertModel
      .find({ sensorsId: { $in: sensorIds } })
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
