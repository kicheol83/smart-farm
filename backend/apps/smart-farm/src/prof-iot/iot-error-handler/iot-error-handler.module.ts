import { Module } from '@nestjs/common';
import { IotErrorHandlerResolver } from './iot-error-handler.resolver';
import { IotErrorHandlerService } from './iot-error-handler.service';

@Module({
  providers: [IotErrorHandlerResolver, IotErrorHandlerService]
})
export class IotErrorHandlerModule {}
