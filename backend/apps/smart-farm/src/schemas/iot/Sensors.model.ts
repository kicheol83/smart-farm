import { Schema } from 'mongoose';
import { SensorsType } from '../../libs/enums/sensors.enum';

export const SensorsSchema = new Schema(
  {
    sensorType: {
      type: String,
      enum: Object.values(SensorsType),
      default: SensorsType.TEMPERATURE,
      required: true,
    },
    sensorsUnit: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
  },
  { timestamps: true, collection: 'sensors' },
);

export const SensorsIndexes = () => {
  SensorsSchema.index({ deviceId: 1 });
  SensorsSchema.index({ sensorType: 1 });
  SensorsSchema.index({ deviceId: 1, sensorType: 1 }, { unique: true });
  SensorsSchema.index({ createdAt: -1 });
};

export default SensorsSchema;
SensorsIndexes();
