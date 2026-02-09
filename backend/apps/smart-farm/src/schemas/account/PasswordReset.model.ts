import { Schema } from 'mongoose';

export const PasswordResetSchema = new Schema(
  {
    passwordToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      required: false,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: true,
    },
  },
  { timestamps: true, collection: 'passwordReset' },
);

export default PasswordResetSchema;
