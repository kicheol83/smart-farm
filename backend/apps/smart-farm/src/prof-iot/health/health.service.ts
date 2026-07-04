import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectType, Field, Query, Resolver } from '@nestjs/graphql';
import { MqttService } from '../../iot/mqtt/mqtt.service';

@ObjectType()
export class ServiceHealth {
  @Field()
  name: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  responseTimeMs?: number;
}

@ObjectType()
export class SystemHealth {
  @Field()
  status: string;

  @Field()
  timestamp: Date;

  @Field(() => [ServiceHealth])
  services: ServiceHealth[];

  @Field()
  uptimeSeconds: number;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectRedis()
    private readonly redis: Redis,

    @InjectConnection()
    private readonly mongoConnection: Connection,

    private readonly mqttService: MqttService,
  ) {}

  public async checkAll(): Promise<SystemHealth> {
    const [mongodb, redis, mqtt] = await Promise.all([
      this.checkMongoDB(),
      this.checkRedis(),
      this.checkMqtt(),
    ]);

    const services = [mongodb, redis, mqtt];
    const allHealthy = services.every((s) => s.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      services,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  private async checkMongoDB(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const state = this.mongoConnection.readyState;
      // 1 = connected, 2 = connecting, 3 = disconnecting, 0 = disconnected
      if (state !== 1) {
        return {
          name: 'mongodb',
          status: 'unhealthy',
          message: `Connection state: ${state}`,
        };
      }

      await this.mongoConnection.db?.admin().ping();
      return {
        name: 'mongodb',
        status: 'healthy',
        responseTimeMs: Date.now() - start,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`MongoDB health check failed: ${err}`);
      return {
        name: 'mongodb',
        status: 'unhealthy',
        message,
      };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const result = await this.redis.ping();
      return {
        name: 'redis',
        status: result === 'PONG' ? 'healthy' : 'unhealthy',
        responseTimeMs: Date.now() - start,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      this.logger.error(`Redis health check failed: ${message}`);

      return {
        name: 'redis',
        status: 'unhealthy',
        message,
      };
    }
  }

  private async checkMqtt(): Promise<ServiceHealth> {
    const connected = this.mqttService.isConnected();
    return {
      name: 'mqtt',
      status: connected ? 'healthy' : 'unhealthy',
      message: connected ? undefined : 'MQTT broker not connected',
    };
  }
}
