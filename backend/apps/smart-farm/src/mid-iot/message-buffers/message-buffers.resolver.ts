import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MessageBuffersService } from './message-buffers.service';
import {
  BufferStats,
  DeadLetterMessage,
} from '../../libs/dto/mid-iot/message-buffer';

@Resolver()
export class MessageBuffersResolver {
  constructor(private readonly bufferService: MessageBuffersService) {}

  @Query(() => BufferStats, {
    description: 'MQTT message buffer holati',
  })
  async messageBufferStats(): Promise<BufferStats> {
    const result = await this.bufferService.getStats();
    return result;
  }

  @Query(() => [DeadLetterMessage], {
    description: 'Dead letter queue dagi muvaffaqiyatsiz xabarlar',
  })
  public async deadLetterMessages(
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<DeadLetterMessage[]> {
    const result = await this.bufferService.getDeadLetterMessages(limit);
    return result as any;
  }

  @Mutation(() => Int, {
    description: 'Dead letter queue ni tozalash',
  })
  public async clearDeadLetterQueue(): Promise<number> {
    const result = await this.bufferService.clearDeadLetter();
    return result;
  }
}
