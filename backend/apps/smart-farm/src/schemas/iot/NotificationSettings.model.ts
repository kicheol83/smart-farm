import { Schema } from 'mongoose';

export const NotificationSettingsSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: true,
      unique: true,
    },
    enabled: { type: Boolean, default: true },
    channels: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    alertThresholds: {
      maxTemperature: { type: Number, default: 35 },
      minTemperature: { type: Number, default: 10 },
      minHumidity: { type: Number, default: 40 },
      maxHumidity: { type: Number, default: 90 },
      minPh: { type: Number, default: 5.5 },
      maxPh: { type: Number, default: 7.5 },
      minSoilMoisture: { type: Number, default: 30 },
    },
    criticalAlerts: { type: Boolean, default: true },
    warningAlerts: { type: Boolean, default: true },
    infoAlerts: { type: Boolean, default: false },
    deviceOfflineAlerts: { type: Boolean, default: true },
    reportReadyAlerts: { type: Boolean, default: true },

    floatingNotifications: { type: Boolean, default: true },
    lockScreenNotifications: { type: Boolean, default: true },
    notificationsManagement: { type: Boolean, default: false },
    triggerEveryNMessages: {
      type: Number,
      default: 1,
      description: '"Every X Message will trigger the event"',
    },
    sendOncePerDays: {
      type: Number,
      default: 1,
      description: '"Event will be sent to user only once per Y" (kun)',
    },
  },
  { timestamps: true, collection: 'notificationSettings' },
);

NotificationSettingsSchema.index({ memberId: 1 }, { unique: true });

export default NotificationSettingsSchema;
