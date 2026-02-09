import { Schema } from 'mongoose';
import { MemberRole, MemberStatus } from '../../libs/enums/member.enum';

export const MemberSchema = new Schema(
  {
    memberFullName: {
      type: String,
      required: true,
    },
    memberEmail: {
      type: String,
      required: true,
      unique: true,
    },
    memberPassword: {
      type: String,
      required: true,
    },
    memberRole: {
      type: String,
      enum: Object.values(MemberRole),
      default: MemberRole.WORKER,
    },

    memberAvatar: {
      type: String,
      default: '',
      required: false,
    },

    memberStatus: {
      type: String,
      enum: Object.values(MemberStatus),
      default: MemberStatus.ACTIVE,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: 'members' },
);

MemberSchema.index({ memberEmail: 1 }, { unique: true });

export default MemberSchema;
