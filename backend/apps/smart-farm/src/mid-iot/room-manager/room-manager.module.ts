import { Module } from '@nestjs/common';
import { RoomManagerService } from './room-manager.service';
import { RoomManagerResolver } from './room-manager.resolver';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [RoomManagerService, RoomManagerResolver],
  exports: [RoomManagerService],
})
export class RoomManagerModule {}
