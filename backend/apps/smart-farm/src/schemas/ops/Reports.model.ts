import * as mongoose from 'mongoose';

const ReportsSchema = new mongoose.Schema(
  {
    reportsType: {
      type: String,
      required: true,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    greenHousesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'reports',
  },
);

ReportsSchema.index({ greenHousesId: 1, generatedAt: -1 });

export default ReportsSchema;
