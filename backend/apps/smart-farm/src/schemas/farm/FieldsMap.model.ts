import { Schema } from 'mongoose';

const CoordinateSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

export const FieldMapSchema = new Schema(
  {
    fieldName: {
      type: String,
      required: true,
    },
    locationName: {
      type: String,
      required: false,
    },
    totalArea: {
      type: Number,
      required: true,
    },
    boundaryCoordinates: {
      type: [CoordinateSchema],
      required: true,
    },
    centerPoint: {
      type: CoordinateSchema,
      required: true,
    },
    farmId: {
      type: Schema.Types.ObjectId,
      ref: 'farms',
      required: true,
    },
  },
  { timestamps: true, collection: 'fieldMaps' },
);

FieldMapSchema.index({ farmId: 1 });
FieldMapSchema.index({ createdAt: -1 });

export default FieldMapSchema;
