import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';

import { Types } from 'mongoose';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  DeleteAccountInput,
  DeleteReasonOption,
  MessageRespons,
} from '../../libs/dto/auth/account';
import { CurrentUser } from '../../libs/types/decorators/current.user';

@Resolver()
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => MessageRespons, {
    description: 'Log out current member — invalidates refresh token',
  })
  @UseGuards(AuthGuard)
  public async logout(@CurrentUser() member: Member): Promise<MessageRespons> {
    const result = await this.accountService.logout(new Types.ObjectId(member._id));
    return result;
  }

  @Mutation(() => MessageRespons, {
    description: 'Soft delete current member account',
  })
  @UseGuards(AuthGuard)
  public async deleteAccount(
    @CurrentUser() member: Member,
    @Args('input') input: DeleteAccountInput,
  ): Promise<MessageRespons> {
    const result = await this.accountService.deleteAccount(
      new Types.ObjectId(member._id),
      input,
    );
    return result;
  }

  @Query(() => [DeleteReasonOption], {
    description: 'Get all available reasons for deleting account',
  })
  @UseGuards(AuthGuard)
  public async deleteAccountReasons(): Promise<DeleteReasonOption[]> {
    const result = await this.accountService.getDeleteReasons();
    return result;
  }
}
