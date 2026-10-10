import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommandService } from './command.service';
import { DeviceCommand, SendCommandInput } from '../../libs/dto/command.dto';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';

import { OwnedBy } from '../../ownership/owned-by.decorator';
@Resolver(() => DeviceCommand)
export class CommandResolver {
  constructor(private readonly commandService: CommandService) {}

  @Mutation(() => DeviceCommand)
  @UseGuards(AuthGuard)
  public async sendDeviceCommand(
    @AuthMember() user: Member,
    @Args('input') input: SendCommandInput,
  ): Promise<DeviceCommand> {
    const result = (await this.commandService.sendCommand(
      input,
      user._id,
    )) as any;
    return result;
  }

  @Query(() => [DeviceCommand])
  @UseGuards(AuthGuard)
  public async deviceCommands(
    @Args('deviceId', { type: () => ID }) deviceId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<DeviceCommand[]> {
    const result = (await this.commandService.findByDevice(
      deviceId,
      limit,
    )) as any;
    return result;
  }

  @Query(() => DeviceCommand)
  @UseGuards(AuthGuard)
  @OwnedBy('command')
  public async deviceCommand(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeviceCommand> {
    const result = (await this.commandService.findOne(id)) as any;
    return result;
  }
}
