import { Schema, Types } from 'mongoose';
import {
  SectionStatus,
  SectionType,
} from '../../libs/dto/farm-context-dto/sections/sections';

export const SectionsSchema = new Schema(
  {
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },

    sectionType: {
      type: String,
      enum: Object.values(SectionType),
      required: true,
    },

    sectionStatus: {
      type: String,
      enum: Object.values(SectionStatus),
      default: SectionStatus.HEALTHY,
    },

    sectionArea: {
      type: Number,
      required: true,
      min: 0,
    },

    plantCount: {
      type: Number,
      required: true,
      min: 0,
    },

    currentHealthIndex: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    sectionGeometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
        default: 'Polygon',
      },

      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },

    greenHouseId: {
      type: Types.ObjectId,
      ref: 'greenHouses',
      required: true,
      index: true,
    },

    cropsId: {
      type: Types.ObjectId,
      ref: 'crops',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'sections',
  },
);

SectionsSchema.index({
  sectionGeometry: '2dsphere',
});

SectionsSchema.index({
  greenHouseId: 1,
});

SectionsSchema.index({
  cropsId: 1,
});

SectionsSchema.index({
  sectionStatus: 1,
});

export default SectionsSchema;
