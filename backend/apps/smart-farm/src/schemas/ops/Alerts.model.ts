import { Schema } from 'mongoose';
import {
  AlertsActualValues,
  AlertSeverity,
} from '../../libs/enums/alerts.enum';

export const AlertsSchema = new Schema(
  {
    alertsType: {
      type: String,
      required: true,
    },
    alertsThreshold: {
      type: Number,
      required: true,
    },
    alertsActualValues: {
      type: String,
      enum: Object.values(AlertsActualValues),
      default: AlertsActualValues.LOW,
    },
    alertsSeverity: {
      type: String,
      enum: Object.values(AlertSeverity),
      default: AlertSeverity.INFO,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    sensorsId: {
      type: Schema.Types.ObjectId,
      ref: 'Sensors',
      required: true,
    },
  },
  { timestamps: true, collection: 'alerts' },
);

AlertsSchema.index({ sensorsId: 1 });

export default AlertsSchema;
