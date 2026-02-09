import { Schema } from 'mongoose';
import { TemperatureUnit } from '../../libs/enums/member.settings.enum';

export const MemberSettingsSchema = new Schema(
  {
    temperature_unit: {
      type: String,
      enum: Object.values(TemperatureUnit),
      default: TemperatureUnit.CELSIUS,
    },

    moisture_unit: {
      type: String,
      required: true,
    },

    language: {
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
  { timestamps: true, collection: 'memberSettings' },
);

export default MemberSettingsSchema;
