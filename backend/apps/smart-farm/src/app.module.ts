import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { GatewayModule } from './gateway/gateway.module';
import { AccountContextModuleModule } from './account-context-module/account-context-module.module';
import { FarmContextModuleModule } from './farm-context-module/farm-context-module.module';
import { IoTcontextModuleModule } from './io-tcontext-module/io-tcontext-module.module';
import { OpsContextModuleModule } from './ops-context-module/ops-context-module.module';
import { BullMqModule } from './bull-mq/bull-mq.module';
import { AuthModule } from './account-context-module/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { T } from './libs/types/common';
import { BullModule } from '@nestjs/bullmq';
import { InjectRedis, RedisModule } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { AdminModule } from './admin/admin.module';
import { IotModule } from './iot/iot.module';
import { MqttModule } from './iot/mqtt/mqtt.module';
import { DeviceAuthModule } from './iot/device-auth/device-auth.module';
import { IotPipelineModule } from './iot/iot-pipeline/iot-pipeline.module';
import { HeartBeatModule } from './heart-beat/heart-beat.module';
import { CommandModule } from './iot/command/command.module';
import { ProfIotModule } from './prof-iot/prof-iot.module';
import { MidIotModule } from './mid-iot/mid-iot.module';
import { IrrigationModule } from './irrigation/irrigation.module';
import { ActuatorModule } from './src/actuator/actuator.module';
import { ActuatorModule } from './actuator/actuator.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: false,
      autoSchemaFile: true,
      subscriptions: {
        'graphql-ws': true,
      },
      formatError: (error: T) => {
        console.log('error', error);
        const graphQLFormattedError = {
          code: error?.extensions.code,
          message:
            error?.extensions?.exception?.response?.message ||
            error?.extensions?.response?.message ||
            error?.message,
        };
        return graphQLFormattedError;
      },
    }),

    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        options: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    DatabaseModule,
    GatewayModule,
    RedisModule,
    AccountContextModuleModule,
    FarmContextModuleModule,
    IoTcontextModuleModule,
    OpsContextModuleModule,
    BullMqModule,
    AuthModule,
    AdminModule,
    IotModule,
    MqttModule,
    DeviceAuthModule,
    IotPipelineModule,
    HeartBeatModule,
    CommandModule,
    ProfIotModule,
    MidIotModule,
    IrrigationModule,
    ActuatorModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async onModuleInit() {
    try {
      const pong = await this.redis.ping();

      if (pong === 'PONG') {
        this.logger.verbose('Redis connected successfully');
        this.logger.verbose('BullMQ connected successfully');
      }
    } catch (err) {
      this.logger.error('Redis/BullMQ connection failed');
      this.logger.error(err);
    }
  }
}
