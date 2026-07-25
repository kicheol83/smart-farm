import * as mongoose from 'mongoose';

const WaterUsageSchema = new mongoose.Schema(
  {
    waterAmount: {
      type: Number,
      required: true,
    },
    recordedAt: {
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
    durationMinutes: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'waterUsages',
  },
);

WaterUsageSchema.index({ greenHouseId: 1, recordedAt: -1 });
WaterUsageSchema.index({ sectionId: 1, recordedAt: -1 });

export default WaterUsageSchema;
