import { Module } from '@nestjs/common';
import { HeartBeatService } from './heart-beat.service';

@Module({
  providers: [HeartBeatService]
})
export class HeartBeatModule {}
