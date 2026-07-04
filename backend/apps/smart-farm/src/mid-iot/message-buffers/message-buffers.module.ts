import { Module } from '@nestjs/common';
import { MessageBuffersService } from './message-buffers.service';
import { MessageBuffersResolver } from './message-buffers.resolver';

@Module({
  providers: [MessageBuffersService, MessageBuffersResolver]
})
export class MessageBuffersModule {}
