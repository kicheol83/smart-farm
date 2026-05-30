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
  async logout(@CurrentUser() member: Member): Promise<MessageRespons> {
    return this.accountService.logout(new Types.ObjectId(member._id));
  }

  @Mutation(() => MessageRespons, {
    description: 'Soft delete current member account',
  })
  @UseGuards(AuthGuard)
  async deleteAccount(
    @CurrentUser() member: Member,
    @Args('input') input: DeleteAccountInput,
  ): Promise<MessageRespons> {
    return this.accountService.deleteAccount(
      new Types.ObjectId(member._id),
      input,
    );
  }

  @Query(() => [DeleteReasonOption], {
    description: 'Get all available reasons for deleting account',
  })
  @UseGuards(AuthGuard)
  deleteAccountReasons(): DeleteReasonOption[] {
    return this.accountService.getDeleteReasons();
  }
}
