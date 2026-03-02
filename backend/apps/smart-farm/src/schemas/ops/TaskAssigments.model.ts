import { Schema } from 'mongoose';

export const TaskAssignmentsSchema = new Schema(
  {
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
      ref: 'Member',
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Tasks',
      required: true,
    },
  },
  { timestamps: true, collection: 'taskAssignments' },
);
TaskAssignmentsSchema.index({ memberId: 1 });
TaskAssignmentsSchema.index({ taskId: 1 });
TaskAssignmentsSchema.index({ createdAt: -1 });

export default TaskAssignmentsSchema;
