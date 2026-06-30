import { Schema } from 'mongoose';

export const DeviceApiKeySchema = new Schema(
  {
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'devices',
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, collection: 'deviceApiKeys' },
);

DeviceApiKeySchema.index({ apiKey: 1 }, { unique: true });
DeviceApiKeySchema.index({ deviceId: 1 }, { unique: true });
DeviceApiKeySchema.index({ isActive: 1 });

export default DeviceApiKeySchema;
