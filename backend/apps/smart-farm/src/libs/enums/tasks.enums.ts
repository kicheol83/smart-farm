import { registerEnumType } from '@nestjs/graphql';

export enum TaskPiority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
registerEnumType(TaskPiority, {
  name: 'TaskPiority',
  description: 'Priority levels for tasks in the smart farm system',
});

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Status of tasks in the smart farm system',
});
