import { Module } from '@nestjs/common';
import { RoomManagerService } from './room-manager.service';
import { RoomManagerResolver } from './room-manager.resolver';

@Module({
  providers: [RoomManagerService, RoomManagerResolver]
})
export class RoomManagerModule {}
