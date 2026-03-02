import { Schema } from 'mongoose';

export const AlertNotificationsSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    alertsId: {
      type: Schema.Types.ObjectId,
      ref: 'Alerts',
      required: true,
    },
  },
  { timestamps: true, collection: 'alertNotifications' },
);

AlertNotificationsSchema.index({ memberId: 1 });
AlertNotificationsSchema.index({ alertsId: 1 });
AlertNotificationsSchema.index({ isRead: 1 });
AlertNotificationsSchema.index({ createdAt: -1 });

export default AlertNotificationsSchema;
