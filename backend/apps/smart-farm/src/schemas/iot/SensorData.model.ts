import { Schema } from 'mongoose';

export const SensorDataSchema = new Schema(
  {
    sensorDataName: {
      type: String,
      required: true,
    },
    sensorDataValue: {
      type: Number,
      required: true,
    },
    recordedAt: {
      type: Date,
      required: true,
    },
    sensorId: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
    },
  },
  { timestamps: true, collection: 'sensor_data' },
);

SensorDataSchema.index({ sensorId: 1 });
SensorDataSchema.index({ recordedAt: -1 });
SensorDataSchema.index({ sensorId: 1, recordedAt: -1 });

export default SensorDataSchema;
