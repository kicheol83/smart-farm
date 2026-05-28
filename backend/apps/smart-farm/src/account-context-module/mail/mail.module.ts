import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullMqModule } from '../../bull-mq/bull-mq.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '../../libs/types/common';
import { EmailProcessor } from './mail.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.EMAIL })],
  providers: [MailService, EmailProcessor],
  exports: [MailService],
})
export class MailModule {}
