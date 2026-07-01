import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { MqttService } from '../mqtt/mqtt.service';
import { CommandStatus, SendCommandInput } from '../../libs/dto/command.dto';
import { IDevice } from '../../io-tcontext-module/devices/devices.service';

export interface IDeviceCommand extends Document {
  _id: Types.ObjectId;
  commandType: string;
  commandStatus: string;
  payload?: string;
  deviceId: Types.ObjectId;
  sentByMemberId: Types.ObjectId;
  response?: string;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);

  constructor(
    private readonly mqttService: MqttService,

    @InjectModel('deviceCommands')
    private readonly commandModel: Model<IDeviceCommand>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,
  ) {}

 public async sendCommand(
    input: SendCommandInput,
    memberId: Types.ObjectId,
  ): Promise<IDeviceCommand> {
    if (!Types.ObjectId.isValid(input.deviceId)) {
      throw new ConflictException('Invalid deviceId.');
    }
    const device = await this.deviceModel.findById(input.deviceId).exec();
    if (!device) {
      throw new NotFoundException('Device not found.');
    }
    const command = await this.commandModel.create({
      commandType: input.commandType,
      commandStatus: CommandStatus.PENDING,
      payload: input.payload,
      deviceId: new Types.ObjectId(input.deviceId),
      sentByMemberId: new Types.ObjectId(memberId),
    });

    const mqttPayload = {
      commandId: String(command._id),
      commandType: input.commandType,
      payload: input.payload ? JSON.parse(input.payload) : {},
      timestamp: new Date().toISOString(),
    };

    this.mqttService.publish(
      MqttService.TOPICS.COMMAND(input.deviceId),
      mqttPayload,
    );

    const updated = await this.commandModel
      .findByIdAndUpdate(
        command._id,
        { commandStatus: CommandStatus.SENT },
        { new: true },
      )
      .exec();

    this.logger.log(
      `Command sent | type=${input.commandType} | device=${input.deviceId}`,
    );

    return updated!;
  }

 public async updateCommandResult(
    commandId: string,
    status: CommandStatus,
    response?: string,
  ): Promise<void> {
    await this.commandModel.findByIdAndUpdate(commandId, {
      commandStatus: status,
      response,
      executedAt: status === CommandStatus.EXECUTED ? new Date() : undefined,
    });

    this.logger.log(`Command result | id=${commandId} | status=${status}`);
  }

  public async findByDevice(deviceId: string, limit = 20): Promise<IDeviceCommand[]> {
    return this.commandModel
      .find({ deviceId: new Types.ObjectId(deviceId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  public async findOne(id: string): Promise<IDeviceCommand> {
    const cmd = await this.commandModel.findById(id).exec();
    if (!cmd) throw new NotFoundException('Command not found.');
    return cmd;
  }
}
