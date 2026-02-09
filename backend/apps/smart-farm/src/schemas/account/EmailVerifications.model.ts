import { Schema } from 'mongoose';

export const EmailVerificationSchema = new Schema(
  {
    emailCode: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
      required: false,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: true,
    },
  },
  { timestamps: true, collection: 'emailVerifications' },
);

export default EmailVerificationSchema;
