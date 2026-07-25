import * as mongoose from 'mongoose';

const ReportEntriesSchema = new mongoose.Schema(
  {
    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
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
      required: true,
      index: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    plantName: {
      type: String,
      required: false,
    },
    areaM2: {
      type: Number,
      required: false,
    },
    healthIndex: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['DONE', 'OPTIMAL', 'ATTENTION'],
      required: true,
    },
    harvestPrediction: {
      type: Date,
      required: false,
    },
    soilMoisture: {
      type: Number,
      required: false,
    },
    humidity: {
      type: Number,
      required: false,
    },
    pestDisease: {
      type: String,
      required: false,
      default: 'No pest',
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'reportEntries',
  },
);

ReportEntriesSchema.index({ greenHouseId: 1, entryDate: -1 });
ReportEntriesSchema.index({ sectionId: 1, entryDate: -1 });

export default ReportEntriesSchema;
