import {
  ObjectType,
  InputType,
  Field,
  ID,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPiority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  valuesMap: {
    TODO: { description: 'Bajarilmagan' },
    IN_PROGRESS: { description: 'Bajarilmoqda' },
    DONE: { description: 'Bajarilgan' },
  },
});

registerEnumType(TaskPiority, {
  name: 'TaskPiority',
  valuesMap: {
    LOW: { description: 'Past' },
    MEDIUM: { description: "O'rta" },
    HIGH: { description: 'Yuqori' },
  },
});

@ObjectType()
export class TaskAssignee {
  @Field(() => ID)
  memberId: string;

  @Field()
  memberFullName: string;

  @Field({ nullable: true })
  memberAvatar?: string;
}

@ObjectType()
export class Task {
  @Field(() => ID)
  _id: string;

  @Field()
  taskTitle: string;

  @Field()
  taskDescription: string;

  @Field(() => TaskStatus)
  taskStatus: TaskStatus;

  @Field(() => TaskPiority)
  taskPriority: TaskPiority;

  @Field({ description: 'Bajarilish muddati' })
  dueDate: Date;

  @Field(() => ID)
  greenHousesId: string;

  @Field(() => [TaskAssignee])
  assignees: TaskAssignee[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class TaskBoardColumn {
  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field(() => Int)
  count: number;

  @Field(() => [Task])
  tasks: Task[];
}

@ObjectType()
export class TaskBoardOverview {
  @Field(() => ID)
  greenHouseId: string;

  @Field(() => Int)
  totalTasks: number;

  @Field(() => Int)
  completedTasks: number;

  @Field(() => Int)
  inProgressTasks: number;

  @Field(() => Int)
  overdueTasks: number;

  @Field(() => [TaskBoardColumn])
  columns: TaskBoardColumn[];
}

@ObjectType()
export class PaginatedTasks {
  @Field(() => [Task])
  items: Task[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  taskTitle: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  taskDescription: string;

  @Field(() => TaskPiority, { defaultValue: TaskPiority.MEDIUM })
  @IsEnum(TaskPiority)
  taskPriority: TaskPiority;

  @Field()
  @IsDateString({ strict: true })
  dueDate: string;

  @Field(() => ID)
  @IsMongoId()
  greenHousesId: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assigneeIds?: string[];
}

@InputType()
export class UpdateTaskInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taskTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taskDescription?: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  taskStatus?: TaskStatus;

  @Field(() => TaskPiority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPiority)
  taskPriority?: TaskPiority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

@InputType()
export class MoveTaskInput {
  @Field(() => ID)
  @IsMongoId()
  taskId: string;

  @Field(() => TaskStatus)
  @IsEnum(TaskStatus)
  newStatus: TaskStatus;
}

@InputType()
export class AssignTaskInput {
  @Field(() => ID)
  @IsMongoId()
  taskId: string;

  @Field(() => ID)
  @IsMongoId()
  memberId: string;
}

@InputType()
export class GetTasksInput {
  @Field(() => ID)
  @IsMongoId()
  greenHousesId: string;

  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  taskStatus?: TaskStatus;

  @Field(() => TaskPiority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPiority)
  taskPriority?: TaskPiority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;
}
