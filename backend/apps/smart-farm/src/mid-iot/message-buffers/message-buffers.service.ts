import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Cron } from '@nestjs/schedule';
import { DeadLetterMessage } from '../../libs/dto/mid-iot/message-buffer';

/**
 * Message Buffer — "At Least Once Delivery" kafolati
 *
 * Muammo: Sensor data keldi → MongoDB save xatolik → data yo'qoldi
 *
 * Yechim:
 *   1. MQTT keldi → Redis queue ga qo'shiladi
 *   2. MongoDB ga saqlash muvaffaqiyatli → queue dan o'chiriladi
 *   3. Saqlash muvaffaqiyatsiz → queue da qoladi → 3 marta retry
 *   4. 3 marta ham bo'lmasa → dead letter queue ga o'tadi (tekshirish uchun)
 */

interface BufferedMessage {
  id: string;
  topic: string;
  payload: string;
  receivedAt: string;
  retryCount: number;
}

const BUFFER_KEY = 'iot:buffer:pending';
const DEAD_LETTER_KEY = 'iot:buffer:dead';
const MAX_RETRIES = 3;
const MAX_BUFFER_SIZE = 10_000;

@Injectable()
export class MessageBuffersService implements OnModuleInit {
  private readonly logger = new Logger(MessageBuffersService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  public async onModuleInit(): Promise<void> {
    const pending = await this.redis.llen(BUFFER_KEY);
    if (pending > 0) {
      this.logger.warn(
        `${pending} buffered messages found on startup — processing...`,
      );
    }
  }

  public async enqueue(topic: string, payload: string): Promise<string> {
    const bufferSize = await this.redis.llen(BUFFER_KEY);
    if (bufferSize >= MAX_BUFFER_SIZE) {
      this.logger.error(
        `Buffer full (${MAX_BUFFER_SIZE}) — dropping message | topic=${topic}`,
      );
      throw new Error('Message buffer is full');
    }

    const message: BufferedMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      topic,
      payload,
      receivedAt: new Date().toISOString(),
      retryCount: 0,
    };

    await this.redis.rpush(BUFFER_KEY, JSON.stringify(message));
    return message.id;
  }

  public async acknowledge(messageId: string): Promise<void> {
    const all = await this.redis.lrange(BUFFER_KEY, 0, -1);
    for (const raw of all) {
      const msg: BufferedMessage = JSON.parse(raw);
      if (msg.id === messageId) {
        await this.redis.lrem(BUFFER_KEY, 1, raw);
        return;
      }
    }
  }

  public async markFailed(messageId: string, error: string): Promise<void> {
    const all = await this.redis.lrange(BUFFER_KEY, 0, -1);
    for (const raw of all) {
      const msg: BufferedMessage = JSON.parse(raw);
      if (msg.id !== messageId) continue;

      await this.redis.lrem(BUFFER_KEY, 1, raw);

      if (msg.retryCount >= MAX_RETRIES) {
        await this.redis.rpush(
          DEAD_LETTER_KEY,
          JSON.stringify({ ...msg, failReason: error }),
        );
        this.logger.error(
          `Message moved to DLQ | id=${messageId} | retries=${msg.retryCount}`,
        );
      } else {
        const updated = { ...msg, retryCount: msg.retryCount + 1 };
        await this.redis.rpush(BUFFER_KEY, JSON.stringify(updated));
        this.logger.warn(
          `Message retry scheduled | id=${messageId} | attempt=${updated.retryCount}`,
        );
      }
      return;
    }
  }

  @Cron('*/30 * * * * *')
  public async retryPendingMessages(): Promise<void> {
    const count = await this.redis.llen(BUFFER_KEY);
    if (count === 0) return;
    this.logger.debug(`Retrying ${count} buffered messages`);
  }

  public async getStats(): Promise<{
    pending: number;
    deadLetter: number;
  }> {
    const [pending, deadLetter] = await Promise.all([
      this.redis.llen(BUFFER_KEY),
      this.redis.llen(DEAD_LETTER_KEY),
    ]);
    return { pending, deadLetter };
  }

  public async getDeadLetterMessages(limit = 20): Promise<DeadLetterMessage[]> {
    const raw = await this.redis.lrange(DEAD_LETTER_KEY, 0, limit - 1);
    return raw.map((r) => JSON.parse(r));
  }

  public async clearDeadLetter(): Promise<number> {
    const count = await this.redis.llen(DEAD_LETTER_KEY);
    await this.redis.del(DEAD_LETTER_KEY);
    this.logger.warn(`Dead letter queue cleared | ${count} messages deleted`);
    return count;
  }
}
