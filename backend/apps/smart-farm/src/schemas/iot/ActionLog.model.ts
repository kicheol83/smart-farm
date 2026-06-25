import { Schema } from 'mongoose';
import { ActionResource, ActionType } from '../../libs/dto/iot-context-dto/action-log/action-log';

export const ActionLogSchema = new Schema(
  {
    actionType: {
      type: String,
      enum: Object.values(ActionType),
      required: true,
    },
    actionResource: {
      type: String,
      enum: Object.values(ActionResource),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
      default: null,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: true,
    },
    memberFullName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: 'actionLogs' },
);

ActionLogSchema.index({ memberId: 1 });
ActionLogSchema.index({ actionType: 1 });
ActionLogSchema.index({ actionResource: 1 });
ActionLogSchema.index({ createdAt: -1 });
ActionLogSchema.index({ memberId: 1, createdAt: -1 });

export default ActionLogSchema;
