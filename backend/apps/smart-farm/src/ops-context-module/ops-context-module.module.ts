import { Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';
import { AlertNotificationsModule } from './alert-notifications/alert-notifications.module';
import { TasksModule } from './tasks/tasks.module';
import { TaskAssigmentsModule } from './task-assigments/task-assigments.module';
import { ReportModule } from './reports/reports.module';

@Module({
  imports: [
    AlertsModule,
    AlertNotificationsModule,
    TasksModule,
    TaskAssigmentsModule,
    ReportModule,
  ],
})
export class OpsContextModuleModule {}
