import * as mongoose from 'mongoose';

const AlertsSchema = new mongoose.Schema(
  {
    alertsType: {
      type: String,
      required: true,
      trim: true,
      description:
        'TEMPERATURE, HUMIDITY, PH, CO2, SOIL_MOISTURE, LIGHT, PLANT_HEALTH, SYSTEM_SENSOR',
    },
    alertsThreshold: {
      type: Number,
      required: true,
    },
    alertsActualValues: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH'],
      required: true,
    },
    alertsSeverity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      required: true,
    },
    sensorsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sensors',
      required: false,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sections',
      required: false,
      index: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'devices',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'alerts',
  },
);

AlertsSchema.index({ sensorsId: 1 });
AlertsSchema.index({ alertsType: 1 });
AlertsSchema.index({ alertsSeverity: 1 });

export default AlertsSchema;
