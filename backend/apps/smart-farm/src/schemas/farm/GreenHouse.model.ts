import { Schema } from 'mongoose';
export const GreenHouseSchema = new Schema(
  {
    greenHouseName: {
      type: String,
      required: true,
    },
    greenHouseType: {
      type: String,
      required: true,
    },
    greenHouseSize: {
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
    farmsId: {
      type: Schema.Types.ObjectId,
      ref: 'farms',
      required: true,
    },
  },
  { timestamps: true, collection: 'greenHouses' },
);

export default GreenHouseSchema;
