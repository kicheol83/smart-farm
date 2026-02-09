import { Schema } from 'mongoose';

export const CropsSchema = new Schema(
  {
    cropsName: {
      type: String,
      required: true,
    },
    cropsOptionalTemps: {
      type: Number,
      required: true,
    },
    cropsOptionalMoistures: {
      type: Number,
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
  },
  { timestamps: true, collection: 'crops' },
);

export default CropsSchema;
