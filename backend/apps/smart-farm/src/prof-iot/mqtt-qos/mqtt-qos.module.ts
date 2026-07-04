import { Module } from '@nestjs/common';
import { MqttQosService } from './mqtt-qos.service';
import { MqttQosResolver } from './mqtt-qos.resolver';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [MqttQosService, MqttQosResolver],
  exports: [MqttQosService],
})
export class MqttQosModule {}
