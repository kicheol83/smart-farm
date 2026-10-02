import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActuatorService } from './actuator.service';
import { AuthGuard } from '../account-context-module/auth/guards/auth.guard';
import {
  Actuator,
  AutomationRule,
  CreateActuatorInput,
  CreateAutomationRuleInput,
  DeviceActuatorState,
  SetActuatorSpeedInput,
  ToggleActuatorInput,
  UpdateActuatorInput,
  UpdateAutomationRuleInput,
} from '../libs/dto/ops-context-dto/actuator/actuator';
import { ActionLogService } from '../io-tcontext-module/action-log/action-log.service';
import { AuthMember } from '../account-context-module/auth/decorators/authMember.decorator';
import { Member } from '../libs/dto/account-context-dto/member/member';
import {
  ActionResource,
  ActionType,
} from '../libs/dto/iot-context-dto/action-log/action-log';
import { RequestMeta } from '../account-context-module/auth/decorators/requesr.meta.decorator';
import { CurrentDevice } from '../account-context-module/auth/decorators/current-device.decorator';
import { DeviceApiKeyGuard } from '../account-context-module/auth/guards/device.api.key.guard';
import { OwnedBy } from '../ownership/owned-by.decorator';

@Resolver(() => Actuator)
export class ActuatorResolver {
  constructor(
    private readonly actuatorService: ActuatorService,
    private readonly actionLogService: ActionLogService,
  ) {}

  @Mutation(() => Actuator)
  @UseGuards(AuthGuard)
  public async createActuator(
    @Args('input') input: CreateActuatorInput,
  ): Promise<Actuator> {
    return this.actuatorService.create(input) as any;
  }

  @Query(() => [Actuator])
  @UseGuards(AuthGuard)
  public async actuatorsByGreenhouse(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<Actuator[]> {
    return this.actuatorService.findByGreenhouse(greenHouseId) as any;
  }

  @Query(() => Actuator)
  @UseGuards(AuthGuard)
  @OwnedBy('actuator')
  public async actuator(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Actuator> {
    return this.actuatorService.findOne(id) as any;
  }

  @Mutation(() => Actuator)
  @UseGuards(AuthGuard)
  @OwnedBy('actuator')
  public async updateActuator(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateActuatorInput,
  ): Promise<Actuator> {
    return this.actuatorService.update(id, input) as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @OwnedBy('actuator')
  public async deleteActuator(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.actuatorService.remove(id);
  }

  @Mutation(() => Actuator)
  @UseGuards(AuthGuard)
  public async toggleActuator(
    @Args('input') input: ToggleActuatorInput,
    @AuthMember() user: Member,
    @RequestMeta() meta: RequestMeta,
  ): Promise<Actuator> {
    const actuator = await this.actuatorService.toggle(input);

    await this.actionLogService.log({
      actionType: ActionType.UPDATE,
      actionResource: ActionResource.DEVICE,
      description: `Actuator ${actuator.actuatorName} → ${input.status}`,
      resourceId: input.actuatorId,
      memberId: user._id.toString(),
      memberFullName: user.memberFullName,
      device: meta.device,
      ipAddress: meta.ipAddress,
      actionCode: 'ACT-01',
    });

    return actuator as any;
  }

  @Mutation(() => Actuator)
  @UseGuards(AuthGuard)
  public async setActuatorSpeed(
    @Args('input') input: SetActuatorSpeedInput,
    @AuthMember() user: Member,
    @RequestMeta() meta: RequestMeta,
  ): Promise<Actuator> {
    const actuator = await this.actuatorService.setSpeed(input);

    await this.actionLogService.log({
      actionType: ActionType.UPDATE,
      actionResource: ActionResource.DEVICE,
      description: `Actuator ${actuator.actuatorName} speed -> ${input.speedPercent}%`,
      resourceId: input.actuatorId,
      memberId: user._id.toString(),
      memberFullName: user.memberFullName,
      device: meta.device,
      ipAddress: meta.ipAddress,
      actionCode: 'ACT-02',
    });

    return actuator as any;
  }

  @Query(() => [DeviceActuatorState])
  @UseGuards(DeviceApiKeyGuard)
  public async getDeviceActuatorStates(
    @CurrentDevice() device: any,
  ): Promise<DeviceActuatorState[]> {
    return this.actuatorService.getDeviceActuatorStates(String(device._id));
  }

  @Mutation(() => AutomationRule)
  @UseGuards(AuthGuard)
  public async createAutomationRule(
    @Args('input') input: CreateAutomationRuleInput,
  ): Promise<AutomationRule> {
    return this.actuatorService.createRule(input) as any;
  }

  @Query(() => [AutomationRule])
  @UseGuards(AuthGuard)
  public async automationRulesByGreenhouse(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<AutomationRule[]> {
    return this.actuatorService.findRulesByGreenhouse(greenHouseId) as any;
  }

  @Mutation(() => AutomationRule)
  @UseGuards(AuthGuard)
  @OwnedBy('automationRule')
  public async updateAutomationRule(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAutomationRuleInput,
  ): Promise<AutomationRule> {
    return this.actuatorService.updateRule(id, input) as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @OwnedBy('automationRule')
  public async deleteAutomationRule(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.actuatorService.removeRule(id);
  }
}
