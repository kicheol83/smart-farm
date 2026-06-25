import { Module } from '@nestjs/common';
import { ActionLogResolver } from './action-log.resolver';
import { ActionLogService } from './action-log.service';
import { ActionLogSchema } from '../../schemas/iot/ActionLog.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'actionLogs', schema: ActionLogSchema },
    ]),
    AuthModule,
  ],
  providers: [ActionLogResolver, ActionLogService],
  exports: [ActionLogService],
})
export class ActionLogModule {}
