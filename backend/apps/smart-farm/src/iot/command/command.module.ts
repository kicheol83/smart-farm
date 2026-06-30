import { Module } from '@nestjs/common';
import { CommandService } from './command.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceCommandSchema } from '../../libs/dto/command.dto';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'deviceCommands',
        schema: DeviceCommandSchema,
      },
    ]),
    MqttModule
  ],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}
