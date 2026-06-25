import { Module } from '@nestjs/common';
import { ActionLogResolver } from './action-log.resolver';
import { ActionLogService } from './action-log.service';

@Module({
  providers: [ActionLogResolver, ActionLogService]
})
export class ActionLogModule {}
