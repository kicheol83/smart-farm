import { Schema } from 'mongoose';

export const SensorCalibrationSchema = new Schema(
  {
    sensorId: { type: Schema.Types.ObjectId, ref: 'sensors', unique: true },
    offset: { type: Number, default: 0 },
    scaleFactor: { type: Number, default: 1.0 },
    description: { type: String, default: '' },
    calibratedAt: { type: Date, default: Date.now },
    calibratedBy: { type: Schema.Types.ObjectId, ref: 'members' },
    isActive: { type: Boolean, default: true },
    history: [
      {
        offset: Number,
        scaleFactor: Number,
        appliedAt: Date,
        appliedBy: { type: Schema.Types.ObjectId, ref: 'members' },
      },
    ],
  },
  { timestamps: true, collection: 'sensorCalibrations' },
);

SensorCalibrationSchema.index({ sensorId: 1 }, { unique: true });

export default SensorCalibrationSchema;
