import { Module } from '@nestjs/common';
import { IotErrorHandlerResolver } from './iot-error-handler.resolver';
import { IotErrorHandlerService, SystemErrorLogSchema } from './iot-error-handler.service';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'systemErrorLogs', schema: SystemErrorLogSchema },
    ]),
    AuthModule,
  ],
  providers: [IotErrorHandlerResolver, IotErrorHandlerService],
  exports: [IotErrorHandlerService],
})
export class IotErrorHandlerModule {}
