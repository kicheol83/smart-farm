import * as mongoose from 'mongoose';

const DevicesSchema = new mongoose.Schema(
  {
    deviceName: {
      type: String,
      required: true,
      trim: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: [
        'SENSOR_HUB',
        'CONTROLLER',
        'CAMERA',
        'GATEWAY',
        'WEATHER_STATION',
      ],
    },
    deviceStatus: {
      type: String,
      required: true,
      enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'],
      default: 'OFFLINE',
    },
    installedAt: {
      type: Date,
      required: true,
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
      index: true,
    },
    networkType: {
      type: String,
      required: false,
      trim: true,
    },
    powerSource: {
      type: String,
      required: false,
      trim: true,
    },
    rssi: {
      type: Number,
      required: false,
    },
    snr: {
      type: Number,
      required: false,
    },
    lastDataReceived: {
      type: Date,
      required: false,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'devices',
  },
);

DevicesSchema.index({ greenHouseId: 1, deviceStatus: 1 });
DevicesSchema.index({ sectionId: 1 });

export default DevicesSchema;
