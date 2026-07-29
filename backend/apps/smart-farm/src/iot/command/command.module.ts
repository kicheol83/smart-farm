import { Module } from '@nestjs/common';
import { CommandService } from './command.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceCommandSchema } from '../../libs/dto/command.dto';
import { MqttModule } from '../mqtt/mqtt.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { CommandResolver } from '../../iot/command/command.resolver';
import { DevicesModule } from '../../io-tcontext-module/devices/devices.module';
import DevicesSchema from '../../schemas/iot/Devices.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'deviceCommands',
        schema: DeviceCommandSchema,
      },
      {
        name: 'devices',
        schema: DevicesSchema,
      },
    ]),
    MqttModule,
    AuthModule,
    DevicesModule,
  ],
  providers: [CommandService, CommandResolver],
  exports: [CommandService],
})
export class CommandModule {}
