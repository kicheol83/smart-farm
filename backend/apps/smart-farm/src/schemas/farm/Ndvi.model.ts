import { Schema } from 'mongoose';

export const NdviAnalyticsSchema = new Schema(
  {
    ndviValue: {
      type: Number,
      required: true,
    },
    healthIndex: {
      type: Number,
      default: null,
    },
    soilMoisture: {
      type: Number,
      default: null,
    },
    recordedAt: {
      type: Date,
      required: true,
    },
    sectorId: {
      type: Schema.Types.ObjectId,
      ref: 'mapSectors',
      required: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'fieldMaps',
      required: true,
    },
  },
  { timestamps: true, collection: 'ndviAnalytics' },
);

NdviAnalyticsSchema.index({ sectorId: 1 });
NdviAnalyticsSchema.index({ fieldId: 1 });
NdviAnalyticsSchema.index({ recordedAt: -1 });
NdviAnalyticsSchema.index({ sectorId: 1, recordedAt: -1 });
NdviAnalyticsSchema.index({ fieldId: 1, recordedAt: -1 });

export default NdviAnalyticsSchema;
