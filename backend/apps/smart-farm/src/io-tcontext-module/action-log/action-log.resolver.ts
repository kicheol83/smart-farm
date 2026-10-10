import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { ActionLogService } from './action-log.service';
import {
  GetActionLogsInput,
  PaginatedActionLogs,
} from '../../libs/dto/iot-context-dto/action-log/action-log';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';
import { Member } from '../../libs/dto/account-context-dto/member/member';

import { MemberRole } from '../../libs/enums/member.enum';
import { RolesGuard } from '../../account-context-module/auth/guards/roles.guard';
import { Roles } from '../../account-context-module/auth/decorators/roles.decorator';
@Resolver()
export class ActionLogResolver {
  constructor(private readonly actionLogService: ActionLogService) {}

  @Query(() => PaginatedActionLogs)
  @UseGuards(AuthGuard)
  public async getMyActionLogs(
    @AuthMember() member: Member,
    @Args('input') input: GetActionLogsInput,
  ): Promise<PaginatedActionLogs> {
    const result = await this.actionLogService.findAll(
      new Types.ObjectId(member._id),
      input,
    );

    return result;
  }

  @Query(() => PaginatedActionLogs)
  @UseGuards(AuthGuard)
  public async myActionLogs(
    @AuthMember() user: Member,
    @Args('input') input: GetActionLogsInput,
  ): Promise<PaginatedActionLogs> {
    const result = this.actionLogService.findAll(
      new Types.ObjectId(user._id),
      input,
    );
    return result;
  }

  @Query(() => PaginatedActionLogs)
  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  public async allActionLogs(
    @Args('input') input: GetActionLogsInput,
  ): Promise<PaginatedActionLogs> {
    const result = this.actionLogService.findAllMembers(input);
    return result;
  }
}
