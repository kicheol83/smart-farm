import { Schema } from 'mongoose';

export const AggregatedSensorDataSchema = new Schema(
  {
    sensorId: {
      type: Schema.Types.ObjectId,
      ref: 'sensors',
      required: true,
    },
    sensorType: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      enum: ['HOURLY', 'DAILY', 'MONTHLY'],
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    avgValue: { type: Number, required: true },
    minValue: { type: Number, required: true },
    maxValue: { type: Number, required: true },
    count: { type: Number, required: true },
  },
  { timestamps: true, collection: 'aggregatedSensorData' },
);

AggregatedSensorDataSchema.index({ sensorId: 1, period: 1, periodStart: -1 });
AggregatedSensorDataSchema.index({ periodStart: -1 });

export default AggregatedSensorDataSchema;
