import { Schema } from 'mongoose';

export const PlantHealthSchema = new Schema(
  {
    plantHealthIndex: {
      type: Number,
      required: true,
    },
    plantValue: {
      type: Number,
      required: true,
    },
    recordeAt: {
      type: Date,
      default: Date.now,
    },

    fieldsId: {
      type: Schema.Types.ObjectId,
      ref: 'fields',
      required: true,
    },
  },
  { timestamps: true, collection: 'plantHealth' },
);

export default PlantHealthSchema;
