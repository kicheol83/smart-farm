import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  ) {}

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

  public async toggle(input: ToggleActuatorInput): Promise<IActuator> {
    const autoOffAt = input.autoOffAfterMinutes
      ? new Date(Date.now() + input.autoOffAfterMinutes * 60_000)
      : undefined;

    const actuator = await this.actuatorModel
      .findByIdAndUpdate(
        input.actuatorId,
        {
          actuatorStatus: input.status,
          lastToggledAt: new Date(),
          autoOffAt: input.status === ActuatorStatus.ON ? autoOffAt : undefined,
        },
        { new: true },
      )
      .exec();

    if (!actuator) throw new NotFoundException('Actuator not found.');
    this.logger.log(
      `Actuator toggled | ${actuator.actuatorName} → ${input.status}` +
        (autoOffAt ? ` (auto-off at ${autoOffAt.toISOString()})` : ''),
    );
    return actuator;
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
        await this.actuatorModel
          .updateOne(
            { _id: a._id },
            { actuatorStatus: ActuatorStatus.OFF, autoOffAt: undefined },
          )
          .exec();
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

      await this.toggle({
        actuatorId: String(rule.actuatorId),
        status: ActuatorStatus.ON,
        autoOffAfterMinutes: rule.actionDurationMinutes,
      });

      await this.ruleModel
        .updateOne({ _id: rule._id }, { lastTriggeredAt: new Date() })
        .exec();
      this.logger.log(
        `Automation rule triggered | ${rule.ruleName} | ${sensorType}=${currentValue} ${rule.triggerCondition} ${rule.triggerThreshold}`,
      );
    }
  }
}
