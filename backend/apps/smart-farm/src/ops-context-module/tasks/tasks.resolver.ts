import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { TasksService } from './tasks.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  AssignTaskInput,
  CreateTaskInput,
  GetTasksInput,
  MoveTaskInput,
  PaginatedTasks,
  Task,
  TaskBoardOverview,
  UpdateTaskInput,
} from '../../libs/dto/ops-context-dto/tasks/task';
import { OwnedBy } from '../../ownership/owned-by.decorator';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly taskService: TasksService) {}

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  public async createTask(
    @Args('input') input: CreateTaskInput,
  ): Promise<Task> {
    return this.taskService.create(input);
  }

  @Query(() => Task)
  @UseGuards(AuthGuard)
  @OwnedBy('task')
  public async task(@Args('id', { type: () => ID }) id: string): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  @OwnedBy('task')
  public async updateTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTaskInput,
  ): Promise<Task> {
    return this.taskService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @OwnedBy('task')
  public async deleteTask(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.taskService.remove(id);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  public async moveTask(@Args('input') input: MoveTaskInput): Promise<Task> {
    return this.taskService.move(input);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  public async assignTaskMember(
    @Args('input') input: AssignTaskInput,
  ): Promise<Task> {
    return this.taskService.assignMember(input);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  public async unassignTaskMember(
    @Args('input') input: AssignTaskInput,
  ): Promise<Task> {
    return this.taskService.unassignMember(input);
  }

  @Query(() => TaskBoardOverview)
  @UseGuards(AuthGuard)
  public async taskBoardOverview(
    @Args('greenHousesId', { type: () => ID }) greenHousesId: string,
  ): Promise<TaskBoardOverview> {
    return this.taskService.getBoardOverview(greenHousesId);
  }

  @Query(() => PaginatedTasks)
  @UseGuards(AuthGuard)
  public async taskList(
    @Args('input') input: GetTasksInput,
  ): Promise<PaginatedTasks> {
    return this.taskService.getTaskList(input);
  }
}
