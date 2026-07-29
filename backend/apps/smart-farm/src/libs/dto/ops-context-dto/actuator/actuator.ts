import {
  ObjectType,
  InputType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum ActuatorType {
  RELAY = 'RELAY',
  WATER_PUMP = 'WATER_PUMP',
  SOLENOID_VALVE = 'SOLENOID_VALVE',
  GROW_LIGHT = 'GROW_LIGHT',
  COOLING_FAN = 'COOLING_FAN',
  SERVO = 'SERVO',
}

registerEnumType(ActuatorType, {
  name: 'ActuatorType',
  valuesMap: {
    RELAY: { description: 'Umumiy relay modul' },
    WATER_PUMP: { description: 'Suv nasosi' },
    SOLENOID_VALVE: { description: "Elektromagnit klapan (sug'orish)" },
    GROW_LIGHT: { description: "O'simlik LED lampasi" },
    COOLING_FAN: { description: 'Ventilyator' },
    SERVO: { description: 'Servo motor (deraza/klapan)' },
  },
});

export enum ActuatorStatus {
  ON = 'ON',
  OFF = 'OFF',
}

registerEnumType(ActuatorStatus, {
  name: 'ActuatorStatus',
  valuesMap: {
    ON: { description: 'Yoqilgan' },
    OFF: { description: "O'chirilgan" },
  },
});

export enum TriggerCondition {
  BELOW = 'BELOW',
  ABOVE = 'ABOVE',
}

registerEnumType(TriggerCondition, {
  name: 'TriggerCondition',
  valuesMap: {
    BELOW: { description: "Qiymat chegaradan past bo'lsa" },
    ABOVE: { description: "Qiymat chegaradan yuqori bo'lsa" },
  },
});

@ObjectType()
export class Actuator {
  @Field(() => ID)
  _id: string;

  @Field()
  actuatorName: string;

  @Field(() => ActuatorType)
  actuatorType: ActuatorType;

  @Field(() => ActuatorStatus)
  actuatorStatus: ActuatorStatus;

  @Field(() => Int, {
    nullable: true,
  })
  speedPercent?: number;

  @Field(() => ID)
  deviceId: string;

  @Field(() => ID)
  greenHouseId: string;

  @Field(() => ID, { nullable: true })
  sectionId?: string;

  @Field()
  autoModeEnabled: boolean;

  @Field({ nullable: true })
  lastToggledAt?: Date;

  @Field({
    nullable: true,
  })
  autoOffAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateActuatorInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  actuatorName: string;

  @Field(() => ActuatorType)
  @IsEnum(ActuatorType)
  actuatorType: ActuatorType;

  @Field(() => ID)
  @IsMongoId()
  deviceId: string;

  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  sectionId?: string;
}

@InputType()
export class ToggleActuatorInput {
  @Field(() => ID)
  @IsMongoId()
  actuatorId: string;

  @Field(() => ActuatorStatus)
  @IsEnum(ActuatorStatus)
  status: ActuatorStatus;

  @Field(() => Int, {
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  autoOffAfterMinutes?: number;
}

@InputType()
export class UpdateActuatorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actuatorName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  autoModeEnabled?: boolean;
}

@ObjectType()
export class AutomationRule {
  @Field(() => ID)
  _id: string;

  @Field()
  ruleName: string;

  @Field(() => ID)
  actuatorId: string;

  @Field()
  triggerSensorType: string;

  @Field(() => TriggerCondition)
  triggerCondition: TriggerCondition;

  @Field(() => Float)
  triggerThreshold: number;

  @Field(() => ID, { nullable: true })
  sectionId?: string;

  @Field(() => ID)
  greenHouseId: string;

  @Field(() => Int, { nullable: true })
  actionDurationMinutes?: number;

  @Field()
  enabled: boolean;

  @Field({ nullable: true })
  lastTriggeredAt?: Date;

  @Field()
  createdAt: Date;
}

@InputType()
export class CreateAutomationRuleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  ruleName: string;

  @Field(() => ID)
  @IsMongoId()
  actuatorId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  triggerSensorType: string;

  @Field(() => TriggerCondition)
  @IsEnum(TriggerCondition)
  triggerCondition: TriggerCondition;

  @Field(() => Float)
  @IsNumber()
  triggerThreshold: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  sectionId?: string;

  @Field(() => ID)
  @IsMongoId()
  greenHouseId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  actionDurationMinutes?: number;
}

@InputType()
export class UpdateAutomationRuleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  triggerThreshold?: number;
}

// ─── ESP32 Polling — "Menda qanday holat bo'lishi kerak?" ─────────────────────

@ObjectType()
export class DeviceActuatorState {
  @Field(() => ID)
  actuatorId: string;

  @Field()
  actuatorName: string;

  @Field(() => ActuatorType)
  actuatorType: ActuatorType;

  @Field(() => ActuatorStatus)
  desiredStatus: ActuatorStatus;

  @Field(() => Int, {
    nullable: true,
    description: 'ESP32 shu qiymatni PWM duty cycle sifatida ishlatadi (0-100)',
  })
  desiredSpeedPercent?: number;
}

@InputType()
export class SetActuatorSpeedInput {
  @Field(() => ID)
  @IsMongoId()
  actuatorId: string;

  @Field(() => Int, {
    description: 'PWM tezlik darajasi 0-100%. 0 = OFF, >0 = ON + shu tezlikda',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  speedPercent: number;
}
