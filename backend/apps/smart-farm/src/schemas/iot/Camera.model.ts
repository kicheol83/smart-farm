import * as mongoose from 'mongoose';

const CameraSchema = new mongoose.Schema(
  {
    cameraStreamUrl: {
      type: String,
      required: true,
    },
    cameraStatus: {
      type: String,
      required: true,
      enum: ['ONLINE', 'OFFLINE', 'RECORDING'],
      default: 'OFFLINE',
    },
    greenHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
      index: true,
    },

    cameraName: {
      type: String,
      required: false,
      trim: true,
    },
    model: {
      type: String,
      required: false,
      trim: true,
    },
    networkStatus: {
      type: String,
      required: false,
      trim: true,
    },
    resolution: {
      type: String,
      required: false,
      trim: true,
    },
    encoding: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'cameras',
  },
);

CameraSchema.index({ greenHouseId: 1, cameraStatus: 1 });

export default CameraSchema;
