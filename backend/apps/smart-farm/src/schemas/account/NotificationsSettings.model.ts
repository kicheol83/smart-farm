import { Schema } from 'mongoose';

export const NotificationsSettings = new Schema(
  {
    emailEnabled: {
      type: Boolean,
      default: true,
    },
    smsEnabled: {
      type: Boolean,
      default: false,
    },
    pushEnabled: {
      type: Boolean,
      default: true,
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
      ref: 'members',
      required: true,
    },
  },
  { timestamps: true, collection: 'notificationsSettings' },
);

export default NotificationsSettings;
