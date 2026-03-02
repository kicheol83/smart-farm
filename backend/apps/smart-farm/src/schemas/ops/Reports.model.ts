import { Schema } from 'mongoose';
import { generate } from 'rxjs';

export const ReportsSchema = new Schema(
  {
    reportsType: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    greenHousesId: {
      type: Schema.Types.ObjectId,
      ref: 'GreenHouse',
      required: true,
    },
  },
  { timestamps: true, collection: 'reports' },
);

export default ReportsSchema;
