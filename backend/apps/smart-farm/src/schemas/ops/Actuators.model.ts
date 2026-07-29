import * as mongoose from 'mongoose';

const ActuatorsSchema = new mongoose.Schema(
  {
    actuatorName: {
      type: String,
      required: true,
      trim: true,
    },
    actuatorType: {
      type: String,
      required: true,
      enum: [
        'RELAY',
        'WATER_PUMP',
        'SOLENOID_VALVE',
        'GROW_LIGHT',
        'COOLING_FAN',
        'SERVO',
      ],
    },
    actuatorStatus: {
      type: String,
      required: true,
      enum: ['ON', 'OFF'],
      default: 'OFF',
    },
    speedPercent: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'devices',
      required: true,
      index: true,
    },
    greenHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sections',
      required: false,
    },
    autoModeEnabled: {
      type: Boolean,
      default: false,
    },
    lastToggledAt: {
      type: Date,
      required: false,
    },
    autoOffAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'actuators',
  },
);

ActuatorsSchema.index({ greenHouseId: 1 });
ActuatorsSchema.index({ deviceId: 1 });

export default ActuatorsSchema;
