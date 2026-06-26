import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import TasksSchema from '../../schemas/ops/Task.model';
import TaskAssignmentsSchema from '../../schemas/ops/TaskAssigments.model';
import MemberSchema from '../../schemas/account/Member.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'tasks', schema: TasksSchema },
      { name: 'taskAssignments', schema: TaskAssignmentsSchema },
      { name: 'members', schema: MemberSchema },
    ]),
    AuthModule,
  ],
  providers: [TasksService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {}
