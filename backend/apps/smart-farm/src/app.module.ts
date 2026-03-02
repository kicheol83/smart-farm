import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { GatewayModule } from './gateway/gateway.module';
import { RedisModule } from './redis/redis.module';
import { AccountContextModuleModule } from './account-context-module/account-context-module.module';
import { FarmContextModuleModule } from './farm-context-module/farm-context-module.module';
import { IoTcontextModuleModule } from './io-tcontext-module/io-tcontext-module.module';
import { OpsContextModuleModule } from './ops-context-module/ops-context-module.module';
import { BullMqModule } from './bull-mq/bull-mq.module';
import { AuthModule } from './account-context-module/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    GatewayModule,
    RedisModule,
    AccountContextModuleModule,
    FarmContextModuleModule,
    IoTcontextModuleModule,
    OpsContextModuleModule,
    BullMqModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver, AuthModule],
})
export class AppModule {}
