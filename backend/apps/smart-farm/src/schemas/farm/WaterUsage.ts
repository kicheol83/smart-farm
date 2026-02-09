import { Schema } from 'mongoose';

export const WaterUsageSchema = new Schema(
  {
    waterAmount: {
      type: Number,
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    greenHouseId: {
      type: Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
    },
  },
  { timestamps: true, collection: 'waterUsages' },
);

export default WaterUsageSchema;
