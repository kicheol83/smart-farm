import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DeleteAccountInput,
  DeleteAccountReason,
  DeleteReasonOption,
  MessageRespons,
} from '../../libs/dto/auth/account';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Mutation } from '@nestjs/graphql/dist/decorators/mutation.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

const DELETE_REASON_LABELS: Record<DeleteAccountReason, string> = {
  [DeleteAccountReason.NOT_USING_ANYMORE]: "I don't use this app anymore",
  [DeleteAccountReason.PRIVACY_CONCERNS]: 'I have privacy or security concerns',
  [DeleteAccountReason.FOUND_BETTER_APP]: 'I found a better alternative',
  [DeleteAccountReason.TOO_MANY_NOTIFICATIONS]:
    'Too many notifications or emails',
  [DeleteAccountReason.TECHNICAL_ISSUES]:
    'I experienced too many technical issues',
  [DeleteAccountReason.OTHER]: 'Other reason',
};

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectModel('Member')
    private readonly memberModel: Model<Member>,
  ) {}

  async logout(memberId: Types.ObjectId): Promise<MessageRespons> {
    const member = await this.findMemberOrThrow(memberId);
    await this.memberModel.findByIdAndUpdate(memberId, {
      refreshToken: null,
    });
    this.logger.log(`Member logged out | ${member.memberEmail}`);
    return { message: 'Logged out successfully.' };
  }

  async deleteAccount(
    memberId: Types.ObjectId,
    input: DeleteAccountInput,
  ): Promise<MessageRespons> {
    const member = await this.findMemberOrThrow(memberId);

    if (member.memberStatus === MemberStatus.DELETE) {
      throw new BadRequestException('Account is already deleted.');
    }

    if (input.reason === DeleteAccountReason.OTHER && !input.feedback?.trim()) {
      throw new BadRequestException(
        'Please provide feedback when selecting "Other" as the reason.',
      );
    }

    await this.memberModel.findByIdAndUpdate(memberId, {
      memberStatus: MemberStatus.DELETE,
      refreshToken: null, // sessionni ham o'chirish
    });

    this.logger.log(
      `Account deleted | ${member.memberEmail} | reason=${input.reason} | feedback=${input.feedback ?? '-'}`,
    );

    return { message: 'Your account has been deleted successfully.' };
  }

  getDeleteReasons(): DeleteReasonOption[] {
    return Object.values(DeleteAccountReason).map((value) => ({
      value,
      label: DELETE_REASON_LABELS[value],
    }));
  }

  private async findMemberOrThrow(memberId: Types.ObjectId): Promise<Member> {
    const member = await this.memberModel.findById(memberId).exec();

    if (!member) {
      throw new NotFoundException('Member not found.');
    }

    return member;
  }
}
