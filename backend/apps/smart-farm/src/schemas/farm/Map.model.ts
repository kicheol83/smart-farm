import { Schema } from 'mongoose';
import { SectorStatus } from '../../libs/dto/farm-context-dto/fields/fields-map';

const CoordinateSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

export const MapSectorSchema = new Schema(
  {
    sectorName: {
      type: String,
      required: true,
    },
    sectorStatus: {
      type: String,
      enum: Object.values(SectorStatus),
      default: SectorStatus.ACTIVE,
      required: true,
    },
    sectorArea: {
      type: Number,
      required: true,
    },
    coordinates: {
      type: [CoordinateSchema],
      required: true,
    },
    centerPoint: {
      type: CoordinateSchema,
      required: true,
    },
    ndviValue: {
      type: Number,
      default: null,
    },
    ndviLevel: {
      type: String,
      default: null,
    },
    healthIndex: {
      type: Number,
      default: null,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'fieldMaps',
      required: true,
    },
    cropsId: {
      type: Schema.Types.ObjectId,
      ref: 'crops',
      default: null,
    },
  },
  { timestamps: true, collection: 'mapSectors' },
);

MapSectorSchema.index({ fieldId: 1 });
MapSectorSchema.index({ sectorStatus: 1 });
MapSectorSchema.index({ fieldId: 1, sectorStatus: 1 });
MapSectorSchema.index({ ndviLevel: 1 });

export default MapSectorSchema;
