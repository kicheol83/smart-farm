import { Schema } from 'mongoose';

export const FieldsSchema = new Schema(
  {
    fieldsArea: {
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

    cropsId: {
      type: Schema.Types.ObjectId,
      ref: 'crops',
      required: true,
    },

    // sections id
  },
  { timestamps: true, collection: 'fields' },
);

export default FieldsSchema;
