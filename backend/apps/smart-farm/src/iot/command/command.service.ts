import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { MqttService } from '../mqtt/mqtt.service';
import { CommandStatus, SendCommandInput } from '../../libs/dto/command.dto';

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
  ) {}

  /**
   * Frontend → MQTT → Qurilma
   *
   * 1. Command ni MongoDB ga PENDING holida saqlash
   * 2. MQTT orqali qurilmaga yuborish
   * 3. Status SENT ga o'tkazish
   *
   * Qurilma bajarib bo'lgach MQTT orqali javob yuboradi:
   * topic: sf/devices/{deviceId}/status
   * payload: { "commandId": "...", "status": "EXECUTED", "response": "..." }
   */
  async sendCommand(
    input: SendCommandInput,
    memberId: string,
  ): Promise<IDeviceCommand> {
    // 1. MongoDB ga saqlash
    const command = await this.commandModel.create({
      commandType: input.commandType,
      commandStatus: CommandStatus.PENDING,
      payload: input.payload,
      deviceId: new Types.ObjectId(input.deviceId),
      sentByMemberId: new Types.ObjectId(memberId),
    });

    // 2. MQTT orqali qurilmaga yuborish
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

    // 3. Status SENT
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

  /**
   * Qurilma javob yuborganda status yangilash.
   * Bu MQTT handler dan chaqiriladi.
   */
  async updateCommandResult(
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

  /**
   * Device bo'yicha command tarixi
   */
  async findByDevice(deviceId: string, limit = 20): Promise<IDeviceCommand[]> {
    return this.commandModel
      .find({ deviceId: new Types.ObjectId(deviceId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<IDeviceCommand> {
    const cmd = await this.commandModel.findById(id).exec();
    if (!cmd) throw new NotFoundException('Command not found.');
    return cmd;
  }
}
