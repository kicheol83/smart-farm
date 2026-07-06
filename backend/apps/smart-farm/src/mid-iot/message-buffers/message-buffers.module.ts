import { Module } from '@nestjs/common';
import { MessageBuffersService } from './message-buffers.service';
import { MessageBuffersResolver } from './message-buffers.resolver';
import { ScheduleModule } from '@nestjs/schedule/dist/schedule.module';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MessageBuffersService, MessageBuffersResolver],
  exports: [MessageBuffersService],
})
export class MessageBuffersModule {}
