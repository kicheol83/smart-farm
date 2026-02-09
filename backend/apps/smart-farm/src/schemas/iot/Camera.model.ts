import { Schema } from 'mongoose';
import { CameraStatus } from '../../libs/enums/sensors.enum';

export const CameraSchema = new Schema(
  {
    cameraStreamUrl: {
      type: String,
      required: true,
    },
    cameraStatus: {
      type: String,
      enum: Object.values(CameraStatus),
      default: CameraStatus.OFFLINE,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    greenHouseId: {
      type: Schema.Types.ObjectId,
      ref: 'GreenHouse',
      required: true,
    },
  },
  { timestamps: true, collection: 'cameras' },
);

CameraSchema.index({ greenHouseId: 1 });
CameraSchema.index({ greenHouseId: 1, cameraStatus: 1 });
CameraSchema.index({ cameraStreamUrl: 1 }, { unique: true });
CameraSchema.index({ createdAt: -1 });

export default CameraSchema;
