import { Schema } from 'mongoose';

export const FarmsSchema = new Schema(
  {
    farmName: {
      type: String,
      required: true,
    },
    farmLocation: {
      type: String,
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

    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: true,
    },
  },
  { timestamps: true, collection: 'farms' },
);

export default FarmsSchema;
