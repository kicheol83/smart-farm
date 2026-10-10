import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Namespace } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  DeviceActuatorState,
  CreateActuatorInput,
  UpdateActuatorInput,
  ToggleActuatorInput,
  SetActuatorSpeedInput,
  CreateAutomationRuleInput,
  UpdateAutomationRuleInput,
  ActuatorStatus,
  TriggerCondition,
} from '../libs/dto/ops-context-dto/actuator/actuator';
import { MqttService } from '../iot/mqtt/mqtt.service';

export const WATER_ACTUATOR_TYPES = new Set(['WATER_PUMP', 'SOLENOID_VALVE']);

const envMinutes = (name: string, fallback: number, min: number): number => {
  const raw = process.env[name];
  const value = Number(raw);
  return raw !== undefined && raw !== '' && Number.isFinite(value) && value >= min
    ? value
    : fallback;
};

export const pumpMaxOnMinutes = (): number => envMinutes('PUMP_MAX_ON_MINUTES', 30, 1);

export const ruleCooldownMinutes = (): number => envMinutes('RULE_COOLDOWN_MINUTES', 10, 0);

export interface IActuator extends Document {
  _id: Types.ObjectId;
  actuatorName: string;
  actuatorType: string;
  actuatorStatus: string;
  speedPercent?: number;
  deviceId: Types.ObjectId;
  greenHouseId: Types.ObjectId;
  sectionId?: Types.ObjectId;
  autoModeEnabled: boolean;
  lastToggledAt?: Date;
  autoOffAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAutomationRule extends Document {
  _id: Types.ObjectId;
  ruleName: string;
  actuatorId: Types.ObjectId;
  triggerSensorType: string;
  triggerCondition: string;
  triggerThreshold: number;
  sectionId?: Types.ObjectId;
  greenHouseId: Types.ObjectId;
  actionDurationMinutes?: number;
  enabled: boolean;
  lastTriggeredAt?: Date;
  createdAt: Date;
}

@Injectable()
export class ActuatorService {
  private readonly logger = new Logger(ActuatorService.name);

  constructor(
    @InjectModel('actuators')
    private readonly actuatorModel: Model<IActuator>,

    @InjectModel('automationRules')
    private readonly ruleModel: Model<IAutomationRule>,

    @InjectModel('waterUsages')
    private readonly waterUsageModel: Model<any>,

    private readonly mqttService: MqttService,
  ) {}

  private wsServer?: Namespace;

  setWsServer(server: Namespace): void {
    this.wsServer = server;
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async autoOffExpired(): Promise<void> {
    const expired = await this.actuatorModel
      .find({ actuatorStatus: ActuatorStatus.ON, autoOffAt: { $lte: new Date() } })
      .select('_id')
      .exec();

    for (const actuator of expired) {
      await this.toggle(
        { actuatorId: String(actuator._id), status: ActuatorStatus.OFF },
        'Auto-off timer elapsed',
      ).catch((err: Error) =>
        this.logger.error(`Auto-off failed | actuator=${String(actuator._id)} | ${err.message}`),
      );
    }
  }

  private async recordWaterUsage(previous: IActuator, stoppedAt: Date): Promise<number | undefined> {
    const isWaterActuator =
      previous.actuatorType === 'WATER_PUMP' || previous.actuatorType === 'SOLENOID_VALVE';
    if (!isWaterActuator || !previous.lastToggledAt) return undefined;

    const minutes = (stoppedAt.getTime() - previous.lastToggledAt.getTime()) / 60000;
    if (minutes <= 0) return undefined;

    const flowLitersPerMinute = Number(process.env.PUMP_FLOW_LPM ?? 12);
    const speed = (previous.speedPercent ?? 100) / 100;
    const waterAmount = Math.round(minutes * flowLitersPerMinute * speed * 10) / 10;

    await this.waterUsageModel.create({
      waterAmount,
      durationMinutes: Math.round(minutes * 10) / 10,
      recordedAt: stoppedAt,
      greenHouseId: previous.greenHouseId,
      sectionId: previous.sectionId,
    });
    return waterAmount;
  }

  private emitActuatorUpdate(actuator: IActuator, reason?: string, waterAmount?: number): void {
    if (!this.wsServer) return;
    this.wsServer.to(`greenhouse:${String(actuator.greenHouseId)}`).emit('actuator-update', {
      greenHouseId: String(actuator.greenHouseId),
      actuatorId: String(actuator._id),
      actuatorName: actuator.actuatorName,
      actuatorType: actuator.actuatorType,
      status: actuator.actuatorStatus,
      reason,
      waterAmount,
      timestamp: new Date().toISOString(),
    });
  }

  public async create(input: CreateActuatorInput): Promise<IActuator> {
    const actuator = await this.actuatorModel.create({
      ...input,
      actuatorStatus: ActuatorStatus.OFF,
      deviceId: new Types.ObjectId(input.deviceId),
      greenHouseId: new Types.ObjectId(input.greenHouseId),
      sectionId: input.sectionId
        ? new Types.ObjectId(input.sectionId)
        : undefined,
    });
    this.logger.log(
      `Actuator created | ${actuator.actuatorName} | type=${actuator.actuatorType}`,
    );
    return actuator;
  }

  public async findByGreenhouse(greenHouseId: string): Promise<IActuator[]> {
    return this.actuatorModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findOne(id: string): Promise<IActuator> {
    const actuator = await this.actuatorModel.findById(id).exec();
    if (!actuator) throw new NotFoundException('Actuator not found.');
    return actuator;
  }

  public async update(
    id: string,
    input: UpdateActuatorInput,
  ): Promise<IActuator> {
    const actuator = await this.actuatorModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!actuator) throw new NotFoundException('Actuator not found.');
    return actuator;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.actuatorModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }

  public async toggle(input: ToggleActuatorInput, reason?: string): Promise<IActuator> {
    const previous = await this.actuatorModel.findById(input.actuatorId).exec();
    if (!previous) throw new NotFoundException('Actuator not found.');
    const now = new Date();

    const isWater = WATER_ACTUATOR_TYPES.has(previous.actuatorType);
    const turningOn = input.status === ActuatorStatus.ON;
    const maxOnMinutes = pumpMaxOnMinutes();
    const onMinutes =
      turningOn && isWater
        ? Math.min(input.autoOffAfterMinutes || maxOnMinutes, maxOnMinutes)
        : input.autoOffAfterMinutes;
    const autoOffAt =
      turningOn && onMinutes ? new Date(now.getTime() + onMinutes * 60_000) : undefined;

    const actuator = await this.actuatorModel
      .findByIdAndUpdate(
        input.actuatorId,
        autoOffAt
          ? { $set: { actuatorStatus: input.status, lastToggledAt: now, autoOffAt } }
          : {
              $set: { actuatorStatus: input.status, lastToggledAt: now },
              $unset: { autoOffAt: 1 },
            },
        { new: true },
      )
      .exec();

    if (!actuator) throw new NotFoundException('Actuator not found.');
    this.logger.log(
      `Actuator toggled | ${actuator.actuatorName} → ${input.status}` +
        (autoOffAt ? ` (auto-off at ${autoOffAt.toISOString()})` : ''),
    );

    let waterAmount: number | undefined;
    if (previous.actuatorStatus === ActuatorStatus.ON && input.status === ActuatorStatus.OFF) {
      waterAmount = await this.recordWaterUsage(previous, now).catch((err: Error) => {
        this.logger.error(`Water usage record failed | ${actuator.actuatorName} | ${err.message}`);
        return undefined;
      });
    }

    if (isWater) {
      this.sendRelayCommand(actuator, autoOffAt);
    }

    if (previous.actuatorStatus !== actuator.actuatorStatus) {
      this.emitActuatorUpdate(actuator, reason, waterAmount);
    }
    return actuator;
  }

  private sendRelayCommand(actuator: IActuator, autoOffAt?: Date): void {
    const on = actuator.actuatorStatus === ActuatorStatus.ON;
    this.mqttService.publish(MqttService.TOPICS.COMMAND(String(actuator.deviceId)), {
      commandId: `${String(actuator._id)}:${actuator.lastToggledAt?.getTime() ?? Date.now()}`,
      commandType: on ? 'RELAY_ON' : 'RELAY_OFF',
      payload: {
        actuatorId: String(actuator._id),
        actuatorType: actuator.actuatorType,
        autoOffAt: autoOffAt ? autoOffAt.toISOString() : null,
        onSec: on && autoOffAt
          ? Math.max(1, Math.ceil((autoOffAt.getTime() - Date.now()) / 1000))
          : null,
      },
      timestamp: new Date().toISOString(),
    });
  }

  public async setSpeed(input: SetActuatorSpeedInput): Promise<IActuator> {
    const status =
      input.speedPercent > 0 ? ActuatorStatus.ON : ActuatorStatus.OFF;

    const actuator = await this.actuatorModel
      .findByIdAndUpdate(
        input.actuatorId,
        {
          actuatorStatus: status,
          speedPercent: input.speedPercent,
          lastToggledAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!actuator) throw new NotFoundException('Actuator not found.');
    this.logger.log(
      `Actuator speed set | ${actuator.actuatorName} → ${input.speedPercent}%`,
    );
    return actuator;
  }

  public async getDeviceActuatorStates(
    deviceId: string,
  ): Promise<DeviceActuatorState[]> {
    const actuators = await this.actuatorModel
      .find({ deviceId: new Types.ObjectId(deviceId) })
      .exec();

    const now = new Date();
    const result: DeviceActuatorState[] = [];

    for (const a of actuators) {
      let status = a.actuatorStatus as ActuatorStatus;

      if (status === ActuatorStatus.ON && a.autoOffAt && a.autoOffAt <= now) {
        await this.toggle(
          { actuatorId: String(a._id), status: ActuatorStatus.OFF },
          'Auto-off timer elapsed',
        );
        status = ActuatorStatus.OFF;
        this.logger.log(
          `Actuator auto-off (muddat tugadi) | ${a.actuatorName}`,
        );
      }

      result.push({
        actuatorId: String(a._id),
        actuatorName: a.actuatorName,
        actuatorType: a.actuatorType as any,
        desiredStatus: status,
        desiredSpeedPercent:
          status === ActuatorStatus.ON ? (a.speedPercent ?? 100) : 0,
      });
    }

    return result;
  }

  public async createRule(
    input: CreateAutomationRuleInput,
  ): Promise<IAutomationRule> {
    const rule = await this.ruleModel.create({
      ...input,
      actuatorId: new Types.ObjectId(input.actuatorId),
      greenHouseId: new Types.ObjectId(input.greenHouseId),
      sectionId: input.sectionId
        ? new Types.ObjectId(input.sectionId)
        : undefined,
    });
    this.logger.log(`Automation rule created | ${rule.ruleName}`);
    return rule;
  }

  public async findRulesByGreenhouse(
    greenHouseId: string,
  ): Promise<IAutomationRule[]> {
    return this.ruleModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async updateRule(
    id: string,
    input: UpdateAutomationRuleInput,
  ): Promise<IAutomationRule> {
    const rule = await this.ruleModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!rule) throw new NotFoundException('Automation rule not found.');
    return rule;
  }

  public async removeRule(id: string): Promise<boolean> {
    const result = await this.ruleModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }

  public async evaluateRules(
    greenHouseId: string,
    sensorType: string,
    currentValue: number,
    sectionId?: string,
  ): Promise<void> {
    const query: any = {
      greenHouseId: new Types.ObjectId(greenHouseId),
      triggerSensorType: sensorType,
      enabled: true,
    };
    if (sectionId) {
      query.$or = [
        { sectionId: new Types.ObjectId(sectionId) },
        { sectionId: { $exists: false } },
      ];
    }

    const rules = await this.ruleModel.find(query).exec();

    for (const rule of rules) {
      const breached =
        rule.triggerCondition === TriggerCondition.BELOW
          ? currentValue < rule.triggerThreshold
          : currentValue > rule.triggerThreshold;

      if (!breached) continue;

      const target = await this.actuatorModel.findById(rule.actuatorId).select('actuatorStatus').exec();
      if (!target || target.actuatorStatus === ActuatorStatus.ON) continue;

      const now = new Date();
      const cooldownStart = new Date(now.getTime() - ruleCooldownMinutes() * 60_000);
      const claimed = await this.ruleModel
        .findOneAndUpdate(
          {
            _id: rule._id,
            $or: [
              { lastTriggeredAt: { $exists: false } },
              { lastTriggeredAt: null },
              { lastTriggeredAt: { $lte: cooldownStart } },
            ],
          },
          { $set: { lastTriggeredAt: now } },
          { new: true },
        )
        .exec();
      if (!claimed) continue;

      await this.toggle(
        {
          actuatorId: String(rule.actuatorId),
          status: ActuatorStatus.ON,
          autoOffAfterMinutes: rule.actionDurationMinutes,
        },
        `${rule.ruleName}: ${sensorType} ${currentValue} ${rule.triggerCondition === TriggerCondition.BELOW ? '<' : '>'} ${rule.triggerThreshold}`,
      );

      this.logger.log(
        `Automation rule triggered | ${rule.ruleName} | ${sensorType}=${currentValue} ${rule.triggerCondition} ${rule.triggerThreshold}`,
      );
    }
  }
}
