import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { UpdateNotificationSettingsInput } from '../../libs/dto/ops-context-dto/alert-notifications/notification-settings';

export interface INotificationSettings extends Document {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  enabled: boolean;
  channels: { email: boolean; push: boolean; inApp: boolean };
  alertThresholds: {
    maxTemperature: number;
    minTemperature: number;
    minHumidity: number;
    maxHumidity: number;
    minPh: number;
    maxPh: number;
    minSoilMoisture: number;
  };
  criticalAlerts: boolean;
  warningAlerts: boolean;
  infoAlerts: boolean;
  deviceOfflineAlerts: boolean;
  reportReadyAlerts: boolean;
  floatingNotifications: boolean;
  lockScreenNotifications: boolean;
  notificationsManagement: boolean;
  triggerEveryNMessages: number;
  sendOncePerDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  channels: { email: true, push: true, inApp: true },
  alertThresholds: {
    maxTemperature: 35,
    minTemperature: 10,
    minHumidity: 40,
    maxHumidity: 90,
    minPh: 5.5,
    maxPh: 7.5,
    minSoilMoisture: 30,
  },
  criticalAlerts: true,
  warningAlerts: true,
  infoAlerts: false,
  deviceOfflineAlerts: true,
  reportReadyAlerts: true,
  floatingNotifications: true,
  lockScreenNotifications: true,
  notificationsManagement: false,
  triggerEveryNMessages: 1,
  sendOncePerDays: 1,
};

@Injectable()
export class NotificationSettingsService {
  private readonly logger = new Logger(NotificationSettingsService.name);

  constructor(
    @InjectModel('notificationSettings')
    private readonly notifModel: Model<INotificationSettings>,
  ) {}

  async getOrCreate(memberId: Types.ObjectId): Promise<INotificationSettings> {
    let settings = await this.notifModel.findOne({ memberId }).exec();

    if (!settings) {
      settings = await this.notifModel.create({
        memberId,
        ...DEFAULT_NOTIFICATION_SETTINGS,
      });
      this.logger.log(
        `Default notification settings created | memberId=${memberId}`,
      );
    }

    return settings;
  }

  async update(
    memberId: Types.ObjectId,
    input: UpdateNotificationSettingsInput,
  ): Promise<INotificationSettings> {
    const current = await this.getOrCreate(memberId);

    const updateData: any = {};

    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.criticalAlerts !== undefined)
      updateData.criticalAlerts = input.criticalAlerts;
    if (input.warningAlerts !== undefined)
      updateData.warningAlerts = input.warningAlerts;
    if (input.infoAlerts !== undefined)
      updateData.infoAlerts = input.infoAlerts;
    if (input.deviceOfflineAlerts !== undefined)
      updateData.deviceOfflineAlerts = input.deviceOfflineAlerts;
    if (input.reportReadyAlerts !== undefined)
      updateData.reportReadyAlerts = input.reportReadyAlerts;
    if (input.floatingNotifications !== undefined)
      updateData.floatingNotifications = input.floatingNotifications;
    if (input.lockScreenNotifications !== undefined)
      updateData.lockScreenNotifications = input.lockScreenNotifications;
    if (input.notificationsManagement !== undefined)
      updateData.notificationsManagement = input.notificationsManagement;
    if (input.triggerEveryNMessages !== undefined)
      updateData.triggerEveryNMessages = input.triggerEveryNMessages;
    if (input.sendOncePerDays !== undefined)
      updateData.sendOncePerDays = input.sendOncePerDays;

    if (input.channels) {
      updateData.channels = {
        email: input.channels.email ?? current.channels.email,
        push: input.channels.push ?? current.channels.push,
        inApp: input.channels.inApp ?? current.channels.inApp,
      };
    }

    if (input.alertThresholds) {
      const t = current.alertThresholds;
      updateData.alertThresholds = {
        maxTemperature:
          input.alertThresholds.maxTemperature ?? t.maxTemperature,
        minTemperature:
          input.alertThresholds.minTemperature ?? t.minTemperature,
        minHumidity: input.alertThresholds.minHumidity ?? t.minHumidity,
        maxHumidity: input.alertThresholds.maxHumidity ?? t.maxHumidity,
        minPh: input.alertThresholds.minPh ?? t.minPh,
        maxPh: input.alertThresholds.maxPh ?? t.maxPh,
        minSoilMoisture:
          input.alertThresholds.minSoilMoisture ?? t.minSoilMoisture,
      };
    }

    const settings = await this.notifModel
      .findOneAndUpdate(
        { memberId },
        { $set: updateData },
        { new: true, upsert: true },
      )
      .exec();

    this.logger.log(`Notification settings updated | memberId=${memberId}`);
    return settings!;
  }
}
