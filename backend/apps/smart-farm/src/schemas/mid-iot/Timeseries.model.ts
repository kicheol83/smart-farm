import { Schema } from 'mongoose';

export const TimeSeriesSensorSchema = new Schema(
  {
    timestamp: { type: Date, required: true },

    metadata: {
      sensorId: { type: Schema.Types.ObjectId, ref: 'sensors', required: true },
      sensorType: { type: String, required: true },
      deviceId: { type: Schema.Types.ObjectId, ref: 'devices', required: true },
      unit: { type: String, required: true },
    },

    value: { type: Number, required: true },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'metadata',
      granularity: 'seconds', // 'seconds' | 'minutes' | 'hours'
    },
    expireAfterSeconds: 90 * 24 * 60 * 60,
    collection: 'timeSeriesSensorData',
  },
);

export default TimeSeriesSensorSchema;
