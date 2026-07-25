import * as mongoose from 'mongoose';

const FarmsSchema = new mongoose.Schema(
  {
    farmName: {
      type: String,
      required: true,
      trim: true,
    },
    farmLocation: {
      type: String,
      required: true,
      trim: true,
    },
    farmDescription: {
      type: String,
      required: false,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'members',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'farms',
  },
);

export default FarmsSchema;
