import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { DeadLetterMessage } from '../../libs/dto/mid-iot/message-buffer';

export interface BufferedMessage {
  id: string;
  topic: string;
  payload: string;
  receivedAt: string;
  retryCount: number;
  done: string[];
  lastError?: string;
}

export type BufferedMessageProcessor = (message: BufferedMessage) => Promise<void>;

export const BUFFER_KEYS = {
  messages: 'iot:buffer:messages',
  inflight: 'iot:buffer:inflight',
  retry: 'iot:buffer:retry',
  dead: 'iot:buffer:dead',
  legacyPending: 'iot:buffer:pending',
} as const;

export const MAX_RETRIES = 3;
export const RETRY_BASE_MS = 30_000;
export const STUCK_AFTER_MS = 5 * 60_000;
export const RETRY_BATCH = 50;
const MAX_BUFFER_SIZE = 10_000;

@Injectable()
export class MessageBuffersService implements OnModuleInit {
  private readonly logger = new Logger(MessageBuffersService.name);
  private processor?: BufferedMessageProcessor;
  private retrying = false;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  public async onModuleInit(): Promise<void> {
    await this.migrateLegacyPending();
  }

  public setProcessor(processor: BufferedMessageProcessor): void {
    this.processor = processor;
  }

  public async enqueue(topic: string, payload: string): Promise<string> {
    const size = await this.redis.hlen(BUFFER_KEYS.messages);
    if (size >= MAX_BUFFER_SIZE) {
      throw new Error(`Message buffer is full (${MAX_BUFFER_SIZE})`);
    }

    const message: BufferedMessage = {
      id: randomUUID(),
      topic,
      payload,
      receivedAt: new Date(this.now()).toISOString(),
      retryCount: 0,
      done: [],
    };

    await this.redis
      .multi()
      .hset(BUFFER_KEYS.messages, message.id, JSON.stringify(message))
      .zadd(BUFFER_KEYS.inflight, this.now(), message.id)
      .exec();
    return message.id;
  }

  public async acknowledge(messageId: string): Promise<void> {
    await this.redis
      .multi()
      .hdel(BUFFER_KEYS.messages, messageId)
      .zrem(BUFFER_KEYS.inflight, messageId)
      .zrem(BUFFER_KEYS.retry, messageId)
      .exec();
  }

  public async markFailed(
    messageId: string,
    error: string,
    done: string[] = [],
  ): Promise<void> {
    const raw = await this.redis.hget(BUFFER_KEYS.messages, messageId);
    if (!raw) return;

    const message: BufferedMessage = JSON.parse(raw);
    const updated: BufferedMessage = {
      ...message,
      retryCount: message.retryCount + 1,
      done: Array.from(new Set([...(message.done ?? []), ...done])),
      lastError: error,
    };

    if (updated.retryCount > MAX_RETRIES) {
      await this.redis
        .multi()
        .hdel(BUFFER_KEYS.messages, messageId)
        .zrem(BUFFER_KEYS.inflight, messageId)
        .zrem(BUFFER_KEYS.retry, messageId)
        .rpush(
          BUFFER_KEYS.dead,
          JSON.stringify({ ...updated, retryCount: MAX_RETRIES, failReason: error }),
        )
        .exec();
      this.logger.error(`Message moved to DLQ | id=${messageId} | ${error}`);
      return;
    }

    const dueAt = this.now() + RETRY_BASE_MS * 2 ** (updated.retryCount - 1);
    await this.redis
      .multi()
      .hset(BUFFER_KEYS.messages, messageId, JSON.stringify(updated))
      .zrem(BUFFER_KEYS.inflight, messageId)
      .zadd(BUFFER_KEYS.retry, dueAt, messageId)
      .exec();
    this.logger.warn(
      `Message retry scheduled | id=${messageId} | attempt=${updated.retryCount} | due=${new Date(dueAt).toISOString()}`,
    );
  }

  @Cron('*/30 * * * * *')
  public async retryPendingMessages(): Promise<void> {
    if (this.retrying || !this.processor) return;
    this.retrying = true;
    try {
      await this.recoverStuckMessages();
      const due = await this.redis.zrangebyscore(
        BUFFER_KEYS.retry,
        '-inf',
        this.now(),
        'LIMIT',
        0,
        RETRY_BATCH,
      );
      for (const id of due) {
        await this.retryOne(id);
      }
    } finally {
      this.retrying = false;
    }
  }

  public async getStats(): Promise<{
    pending: number;
    retrying: number;
    deadLetter: number;
  }> {
    const [pending, retrying, deadLetter] = await Promise.all([
      this.redis.hlen(BUFFER_KEYS.messages),
      this.redis.zcard(BUFFER_KEYS.retry),
      this.redis.llen(BUFFER_KEYS.dead),
    ]);
    return { pending, retrying, deadLetter };
  }

  public async getDeadLetterMessages(limit = 20): Promise<DeadLetterMessage[]> {
    const raw = await this.redis.lrange(BUFFER_KEYS.dead, 0, limit - 1);
    return raw.map((r) => JSON.parse(r));
  }

  public async clearDeadLetter(): Promise<number> {
    const count = await this.redis.llen(BUFFER_KEYS.dead);
    await this.redis.del(BUFFER_KEYS.dead);
    this.logger.warn(`Dead letter queue cleared | ${count} messages deleted`);
    return count;
  }

  private async retryOne(id: string): Promise<void> {
    const claimed = await this.redis.zrem(BUFFER_KEYS.retry, id);
    if (claimed !== 1) return;

    const raw = await this.redis.hget(BUFFER_KEYS.messages, id);
    if (!raw) return;

    await this.redis.zadd(BUFFER_KEYS.inflight, this.now(), id);
    try {
      await this.processor!(JSON.parse(raw));
    } catch (err) {
      await this.markFailed(id, err instanceof Error ? err.message : String(err));
    }
  }

  private async recoverStuckMessages(): Promise<void> {
    const stuck = await this.redis.zrangebyscore(
      BUFFER_KEYS.inflight,
      '-inf',
      this.now() - STUCK_AFTER_MS,
      'LIMIT',
      0,
      RETRY_BATCH,
    );
    for (const id of stuck) {
      await this.markFailed(id, 'Processing was interrupted before it finished.');
    }
  }

  private async migrateLegacyPending(): Promise<void> {
    const legacy = await this.redis.lrange(BUFFER_KEYS.legacyPending, 0, -1);
    if (legacy.length === 0) return;

    const pipeline = this.redis.multi();
    for (const raw of legacy) {
      const old = JSON.parse(raw);
      const message: BufferedMessage = {
        id: randomUUID(),
        topic: old.topic,
        payload: old.payload,
        receivedAt: old.receivedAt ?? new Date(this.now()).toISOString(),
        retryCount: 0,
        done: [],
      };
      pipeline
        .hset(BUFFER_KEYS.messages, message.id, JSON.stringify(message))
        .zadd(BUFFER_KEYS.retry, this.now(), message.id);
    }
    pipeline.del(BUFFER_KEYS.legacyPending);
    await pipeline.exec();
    this.logger.warn(`Moved ${legacy.length} legacy buffered messages into the retry queue`);
  }

  private now(): number {
    return Date.now();
  }
}
