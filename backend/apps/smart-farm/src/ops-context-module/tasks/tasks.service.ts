import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  AssignTaskInput,
  GetTasksInput,
  TaskStatus,
  Task,
  TaskBoardOverview,
  TaskAssignee,
  PaginatedTasks,
} from '../../libs/dto/ops-context-dto/tasks/task';

export interface ITask extends Document {
  _id: Types.ObjectId;
  taskTitle: string;
  taskDescription: string;
  taskStatus: string;
  taskPriority: string;
  dueDate: Date;
  greenHousesId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ITaskAssignment extends Document {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  taskId: Types.ObjectId;
  createdAt: Date;
}

interface IMember extends Document {
  _id: Types.ObjectId;
  memberFullName: string;
  memberAvatar?: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel('tasks')
    private readonly taskModel: Model<ITask>,

    @InjectModel('taskAssignments')
    private readonly assignmentModel: Model<ITaskAssignment>,

    @InjectModel('members')
    private readonly memberModel: Model<IMember>,
  ) {}

  public async create(input: CreateTaskInput): Promise<Task> {
    const task = await this.taskModel.create({
      taskTitle: input.taskTitle,
      taskDescription: input.taskDescription,
      taskStatus: TaskStatus.TODO,
      taskPriority: input.taskPriority,
      dueDate: new Date(input.dueDate),
      greenHousesId: new Types.ObjectId(input.greenHousesId),
    });

    if (input.assigneeIds?.length) {
      await this.assignmentModel.insertMany(
        input.assigneeIds.map((memberId) => ({
          memberId: new Types.ObjectId(memberId),
          taskId: task._id,
        })),
      );
    }

    this.logger.log(`Task created | ${task.taskTitle}`);
    return this.toTask(task);
  }

  public async findOne(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found.');
    return this.toTask(task);
  }

  public async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const updateData: any = { ...input };
    if (input.dueDate) updateData.dueDate = new Date(input.dueDate);

    const task = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!task) throw new NotFoundException('Task not found.');
    return this.toTask(task);
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Task not found.');
    await this.assignmentModel.deleteMany({ taskId: new Types.ObjectId(id) });
    return true;
  }

  public async move(input: MoveTaskInput): Promise<Task> {
    const task = await this.taskModel
      .findByIdAndUpdate(
        input.taskId,
        { taskStatus: input.newStatus },
        { new: true },
      )
      .exec();
    if (!task) throw new NotFoundException('Task not found.');
    this.logger.log(`Task moved | ${task.taskTitle} → ${input.newStatus}`);
    return this.toTask(task);
  }

  public async assignMember(input: AssignTaskInput): Promise<Task> {
    const exists = await this.assignmentModel.findOne({
      taskId: new Types.ObjectId(input.taskId),
      memberId: new Types.ObjectId(input.memberId),
    });

    if (!exists) {
      await this.assignmentModel.create({
        taskId: new Types.ObjectId(input.taskId),
        memberId: new Types.ObjectId(input.memberId),
      });
    }

    return this.findOne(input.taskId);
  }

  public async unassignMember(input: AssignTaskInput): Promise<Task> {
    await this.assignmentModel.deleteOne({
      taskId: new Types.ObjectId(input.taskId),
      memberId: new Types.ObjectId(input.memberId),
    });
    return this.findOne(input.taskId);
  }

  public async getBoardOverview(
    greenHousesId: string,
  ): Promise<TaskBoardOverview> {
    const tasks = await this.taskModel
      .find({ greenHousesId: new Types.ObjectId(greenHousesId) })
      .sort({ createdAt: -1 })
      .exec();

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.dueDate < now && t.taskStatus !== TaskStatus.DONE,
    ).length;

    const statuses: TaskStatus[] = [
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];

    const columns = await Promise.all(
      statuses.map(async (status) => {
        const columnTasks = tasks.filter((t) => t.taskStatus === status);
        return {
          status,
          count: columnTasks.length,
          tasks: await Promise.all(columnTasks.map((t) => this.toTask(t))),
        };
      }),
    );

    return {
      greenHouseId: greenHousesId,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.taskStatus === TaskStatus.DONE)
        .length,
      inProgressTasks: tasks.filter(
        (t) => t.taskStatus === TaskStatus.IN_PROGRESS,
      ).length,
      overdueTasks,
      columns,
    };
  }

  public async getTaskList(input: GetTasksInput): Promise<PaginatedTasks> {
    const query: any = {
      greenHousesId: new Types.ObjectId(input.greenHousesId),
    };

    if (input.taskStatus) query.taskStatus = input.taskStatus;
    if (input.taskPriority) query.taskPriority = input.taskPriority;
    if (input.search) {
      query.taskTitle = { $regex: input.search, $options: 'i' };
    }

    const sortField = input.sortBy ?? 'dueDate';
    const sort: any = { [sortField]: 1 };

    const limit = input.limit ?? 20;
    const page = input.page ?? 1;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.taskModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.taskModel.countDocuments(query),
    ]);

    return {
      items: await Promise.all(tasks.map((t) => this.toTask(t))),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async toTask(task: ITask): Promise<Task> {
    const assignments = await this.assignmentModel
      .find({ taskId: task._id })
      .exec();

    const memberIds = assignments.map((a) => a.memberId);
    const members = await this.memberModel
      .find({ _id: { $in: memberIds } })
      .exec();

    const assignees: TaskAssignee[] = members.map((m) => ({
      memberId: String(m._id),
      memberFullName: m.memberFullName,
      memberAvatar: m.memberAvatar,
    }));

    return {
      _id: String(task._id),
      taskTitle: task.taskTitle,
      taskDescription: task.taskDescription,
      taskStatus: task.taskStatus as TaskStatus,
      taskPriority: task.taskPriority as any,
      dueDate: task.dueDate,
      greenHousesId: String(task.greenHousesId),
      assignees,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
