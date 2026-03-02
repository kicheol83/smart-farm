import { Schema } from 'mongoose';
import { TaskPiority, TaskStatus } from '../../libs/enums/tasks.enums';

export const TasksSchema = new Schema(
  {
    taskTitle: {
      type: String,
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
    },
    taskStatus: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    taskPriority: {
      type: String,
      enum: Object.values(TaskPiority),
      default: TaskPiority.MEDIUM,
    },
    dueData: {
      type: Date,
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
    greenHousesId: {
      type: Schema.Types.ObjectId,
      ref: 'GreenHouse',
      required: true,
    },
  },
  { timestamps: true, collection: 'tasks' },
);

TasksSchema.index({ greenHousesId: 1 });
TasksSchema.index({ taskStatus: 1 });
TasksSchema.index({ taskPriority: 1 });
TasksSchema.index({ dueData: 1 });
TasksSchema.index({ createdAt: -1 });

export default TasksSchema;
