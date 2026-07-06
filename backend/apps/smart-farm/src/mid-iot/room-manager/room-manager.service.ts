import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { RoomStats } from '../../libs/dto/mid-iot/room-manager';

const ROOM_PREFIX = 'ws:room:';
const PRESENCE_TTL = 120;
const THROTTLE_KEY = (socketId: string) => `ws:throttle:${socketId}`;
const MAX_EVENTS_PER_SEC = 10;

@Injectable()
export class RoomManagerService {
  private readonly logger = new Logger(RoomManagerService.name);
  private wsServer?: Server;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  setServer(server: Server): void {
    this.wsServer = server;
  }

  async joinRoom(
    socket: Socket,
    greenHouseId: string,
    memberId: string,
  ): Promise<void> {
    const roomKey = `${ROOM_PREFIX}${greenHouseId}`;

    socket.join(`greenhouse:${greenHouseId}`);

    await this.redis.hset(
      roomKey,
      socket.id,
      JSON.stringify({
        memberId,
        joinedAt: new Date().toISOString(),
        socketId: socket.id,
      }),
    );
    await this.redis.expire(roomKey, PRESENCE_TTL);

    const count = await this.redis.hlen(roomKey);
    this.logger.log(
      `User joined | gh=${greenHouseId} | member=${memberId} | total=${count}`,
    );
  }

  async leaveRoom(socket: Socket, greenHouseId: string): Promise<void> {
    const roomKey = `${ROOM_PREFIX}${greenHouseId}`;
    await this.redis.hdel(roomKey, socket.id);
    socket.leave(`greenhouse:${greenHouseId}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.redis.del(THROTTLE_KEY(socket.id));

    const rooms = await this.redis.keys(`${ROOM_PREFIX}*`);
    for (const roomKey of rooms) {
      await this.redis.hdel(roomKey, socket.id);
    }
  }

  async throttledEmit(
    socket: Socket,
    event: string,
    data: any,
  ): Promise<boolean> {
    const key = THROTTLE_KEY(socket.id);
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, 1);
    }

    if (count > MAX_EVENTS_PER_SEC) {
      return false;
    }

    socket.emit(event, data);
    return true;
  }

  broadcastToGreenhouse(greenHouseId: string, event: string, data: any): void {
    if (!this.wsServer) return;
    this.wsServer.to(`greenhouse:${greenHouseId}`).emit(event, data);
  }

  async emitToMember(
    memberId: string,
    event: string,
    data: any,
  ): Promise<void> {
    if (!this.wsServer) return;

    const rooms = await this.redis.keys(`${ROOM_PREFIX}*`);
    const targetSockets: string[] = [];

    for (const roomKey of rooms) {
      const members = await this.redis.hgetall(roomKey);
      for (const [socketId, raw] of Object.entries(members)) {
        const info = JSON.parse(raw);
        if (info.memberId === memberId) {
          targetSockets.push(socketId);
        }
      }
    }

    for (const socketId of targetSockets) {
      this.wsServer.to(socketId).emit(event, data);
    }
  }

  async getRoomStats(greenHouseId: string): Promise<RoomStats> {
    const roomKey = `${ROOM_PREFIX}${greenHouseId}`;
    const members = (await this.redis.hgetall(roomKey)) ?? {};

    return {
      greenHouseId,
      activeConnections: Object.keys(members).length,
      socketIds: Object.keys(members),
    };
  }

  async getAllRoomStats(): Promise<RoomStats[]> {
    const keys = await this.redis.keys(`${ROOM_PREFIX}*`);
    const stats: RoomStats[] = [];

    for (const key of keys) {
      const greenHouseId = key.replace(ROOM_PREFIX, '');
      stats.push(await this.getRoomStats(greenHouseId));
    }

    return stats;
  }

  async getTotalConnections(): Promise<number> {
    const keys = await this.redis.keys(`${ROOM_PREFIX}*`);
    let total = 0;
    for (const key of keys) {
      total += await this.redis.hlen(key);
    }
    return total;
  }
}
