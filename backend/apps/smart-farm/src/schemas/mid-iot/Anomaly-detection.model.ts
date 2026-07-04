import { Schema } from 'mongoose';

export const AnomalyLogSchema = new Schema(
  {
    sensorId: { type: Schema.Types.ObjectId, ref: 'sensors', required: true },
    sensorType: { type: String, required: true },
    deviceId: { type: Schema.Types.ObjectId, ref: 'devices', required: true },
    greenHouseId: {
      type: Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
    },
    value: { type: Number, required: true },
    zScore: { type: Number, required: true },
    meanValue: { type: Number, required: true },
    stdValue: { type: Number, required: true },
    severity: { type: String, enum: ['WARNING', 'CRITICAL'], required: true },
    resolvedAt: { type: Date, default: null },
    detectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'anomalyLogs' },
);

AnomalyLogSchema.index({ sensorId: 1, detectedAt: -1 });
AnomalyLogSchema.index({ greenHouseId: 1, detectedAt: -1 });
AnomalyLogSchema.index({ severity: 1 });
AnomalyLogSchema.index({ resolvedAt: 1 });

export const SensorStatsSchema = new Schema(
  {
    sensorId: { type: Schema.Types.ObjectId, ref: 'sensors', unique: true },
    mean: { type: Number, required: true },
    std: { type: Number, required: true },
    sampleSize: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'sensorStats' },
);
