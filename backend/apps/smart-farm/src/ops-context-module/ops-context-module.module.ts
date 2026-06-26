import { Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';
import { AlertNotificationsModule } from './alert-notifications/alert-notifications.module';
import { TasksModule } from './tasks/tasks.module';
import { TaskAssigmentsModule } from './task-assigments/task-assigments.module';
import { ReportModule } from './reports/reports.module';
import { TaskResolver } from './task/task.resolver';
import { TaskService } from './task/task.service';

@Module({
  imports: [
    AlertsModule,
    AlertNotificationsModule,
    TasksModule,
    TaskAssigmentsModule,
    ReportModule,
  ],
  providers: [TaskResolver, TaskService],
})
export class OpsContextModuleModule {}
