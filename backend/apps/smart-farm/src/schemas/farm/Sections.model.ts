import { Schema } from 'mongoose';
import { SectionStatus, SectionType } from '../../libs/dto/farm-context-dto/sections/sections';

export const SectionsSchema = new Schema(
  {
    sectionName: {
      type: String,
      required: true,
    },
    sectionType: {
      type: String,
      enum: Object.values(SectionType),
      default: SectionType.HYDROPONIC,
      required: true,
    },
    sectionStatus: {
      type: String,
      enum: Object.values(SectionStatus),
      default: SectionStatus.HEALTHY,
      required: true,
    },
    sectionArea: {
      type: Number,
      required: true,
    },
    plantCount: {
      type: Number,
      required: true,
    },
    currentHealthIndex: {
      type: Number,
      default: null,
    },
    greenHouseId: {
      type: Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
    },
    cropsId: {
      type: Schema.Types.ObjectId,
      ref: 'crops',
      required: false,
      default: null,
    },

    mapPositionX: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    mapPositionY: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true, collection: 'sections' },
);

SectionsSchema.index({ greenHouseId: 1 });
SectionsSchema.index({ sectionStatus: 1 });
SectionsSchema.index({ greenHouseId: 1, sectionStatus: 1 });
SectionsSchema.index({ cropsId: 1 });

export default SectionsSchema;
