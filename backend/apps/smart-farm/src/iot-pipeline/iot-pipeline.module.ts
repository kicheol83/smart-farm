import { Module } from '@nestjs/common';
import { IotPipelineService } from './iot-pipeline.service';

@Module({
  providers: [IotPipelineService]
})
export class IotPipelineModule {}
