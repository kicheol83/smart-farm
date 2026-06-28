import { Module } from '@nestjs/common';
import { IotService } from './iot.service';

@Module({
  providers: [IotService]
})
export class IotModule {}
