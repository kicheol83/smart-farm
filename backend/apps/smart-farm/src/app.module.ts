import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { GatewayModule } from './gateway/gateway.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot(), ComponentsModule, DatabaseModule, GatewayModule, RedisModule],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
