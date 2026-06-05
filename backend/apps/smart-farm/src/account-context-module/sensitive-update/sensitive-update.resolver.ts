import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { SensitiveUpdateService } from './sensitive-update.service';
import { AuthService } from '../auth/auth.service';
import {
  ConfirmSensitiveUpdateInput,
  RequestSensitiveUpdateInput,
  SensitiveUpdateResponse,
} from '../../libs/dto/auth/sensitive.update';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { CurrentUser } from '../../libs/types/decorators/current.user';

@Resolver()
export class SensitiveUpdateResolver {
  constructor(
    private readonly sensitiveUpdateService: SensitiveUpdateService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => SensitiveUpdateResponse, {
    description:
      'Request email or password change — sends OTP to current email',
  })
  @UseGuards(AuthGuard)
  public async requestSensitiveUpdate(
    @CurrentUser() member: Member,
    @Args('input') input: RequestSensitiveUpdateInput,
  ): Promise<SensitiveUpdateResponse> {
    const result = await this.sensitiveUpdateService.requestUpdate(
      new Types.ObjectId(member._id),
      input,
    );
    return result;
  }

  @Mutation(() => SensitiveUpdateResponse, {
    description:
      'Confirm email or password change with OTP — returns new access token',
  })
  @UseGuards(AuthGuard)
  public async confirmSensitiveUpdate(
    @CurrentUser() member: Member,
    @Args('input') input: ConfirmSensitiveUpdateInput,
  ): Promise<SensitiveUpdateResponse> {
    const result = await this.sensitiveUpdateService.confirmUpdate(
      new Types.ObjectId(member._id),
      input,
      (member) => this.authService.createToken(member),
    );
    return result;
  }
}
