import { Schema } from 'mongoose';
import { AreaUnit, Language, TemperatureUnit, TimeFormat, WaterUnit } from '../../libs/dto/account-context-dto/member-settings/settings';

export const GeneralSettingsSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: true,
      unique: true,
    },
    language: {
      type: String,
      enum: Object.values(Language),
      default: Language.EN,
    },
    timezone: {
      type: String,
      default: 'Asia/Tashkent',
    },
    units: {
      temperatureUnit: {
        type: String,
        enum: Object.values(TemperatureUnit),
        default: TemperatureUnit.CELSIUS,
      },
      areaUnit: {
        type: String,
        enum: Object.values(AreaUnit),
        default: AreaUnit.SQUARE_METER,
      },
      waterUnit: {
        type: String,
        enum: Object.values(WaterUnit),
        default: WaterUnit.LITER,
      },
      timeFormat: {
        type: String,
        enum: Object.values(TimeFormat),
        default: TimeFormat.FORMAT_24H,
      },
    },
  },
  { timestamps: true, collection: 'generalSettings' },
);

GeneralSettingsSchema.index({ memberId: 1 }, { unique: true });

export default GeneralSettingsSchema;
