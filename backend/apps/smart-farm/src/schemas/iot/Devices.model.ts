import { Schema } from 'mongoose';
import { DeviceStatus, DeviceType } from '../../libs/enums/devices.enum';

export const DevicesSchema = new Schema(
  {
    deviceName: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: Object.values(DeviceType),
      default: DeviceType.SENSOR_HUB,
      required: true,
    },
    deviceStatus: {
      type: String,
      enum: Object.values(DeviceType),
      default: DeviceStatus.OFFLINE,
      required: true,
    },
    installedAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    greenHouseId: {
      type: Schema.Types.ObjectId,
      ref: 'GreenHouse',
      required: true,
    },
  },
  { timestamps: true, collection: 'devices' },
);

DevicesSchema.index({ greenHouseId: 1 });
DevicesSchema.index({ deviceType: 1 });
DevicesSchema.index({ deviceStatus: 1 });
DevicesSchema.index({ deviceName: 1 }, { unique: true });
DevicesSchema.index({ installedAt: -1 });

export default DevicesSchema;
