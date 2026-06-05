import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { Member } from '../../libs/dto/account-context-dto/member/member';
import { AuthService } from '../auth/auth.service';
import { EmailVerificationService } from '../email-verifications/email-verifications.service';
import { MailService } from '../mail/mail.service';
import {
  ConfirmSensitiveUpdateInput,
  RequestSensitiveUpdateInput,
  SensitiveUpdateResponse,
} from '../../libs/dto/auth/sensitive.update';
import { PENDING_PREFIX, PENDING_TTL } from '../../libs/types/common';

@Injectable()
export class SensitiveUpdateService {
  private readonly logger = new Logger(SensitiveUpdateService.name);

  constructor(
    @InjectModel('Member')
    private readonly memberModel: Model<Member>,

    @InjectRedis()
    private readonly redis: Redis,

    private readonly emailVerificationService: EmailVerificationService,
    private readonly mailService: MailService,
    private readonly authService: AuthService,
  ) {}

  public async requestUpdate(
    memberId: Types.ObjectId,
    input: RequestSensitiveUpdateInput,
  ): Promise<SensitiveUpdateResponse> {
    if (!input.newEmail && !input.newPassword) {
      throw new BadRequestException(
        'Please provide newEmail or newPassword to update.',
      );
    }
    const member = await this.findMemberOrThrow(memberId);
    if (input.newEmail) {
      const existing = await this.memberModel
        .findOne({ memberEmail: input.newEmail.toLowerCase() })
        .exec();

      if (existing && String(existing._id) !== String(memberId)) {
        throw new BadRequestException('This email is already in use.');
      }
    }

    // O'zgarishni Redis ga saqlash (confirm qilguncha)
    const pendingData: Record<string, string> = {};
    if (input.newEmail) {
      pendingData.newEmail = input.newEmail.toLowerCase();
    }
    if (input.newPassword) {
      pendingData.newPassword = await bcrypt.hash(input.newPassword, 12);
    }

    await this.redis.setex(
      `${PENDING_PREFIX}${memberId}`,
      PENDING_TTL,
      JSON.stringify(pendingData),
    );

    await this.emailVerificationService.checkCooldown(memberId);

    const emailCode =
      await this.emailVerificationService.generateAndSave(memberId);
    await this.mailService.sendEmailVerificationOtp(
      member.memberEmail,
      member.memberFullName,
      emailCode,
    );

    const updateTarget = [
      input.newEmail ? 'email' : '',
      input.newPassword ? 'password' : '',
    ]
      .filter(Boolean)
      .join(' and ');

    this.logger.log(
      `Sensitive update requested | ${member.memberEmail} | updating: ${updateTarget}`,
    );

    return {
      message: `Verification code sent to ${member.memberEmail}. Enter the code to confirm your ${updateTarget} change.`,
    };
  }

  public async confirmUpdate(
    memberId: Types.ObjectId,
    input: ConfirmSensitiveUpdateInput,
    createToken: (member: Member) => Promise<string>,
  ): Promise<SensitiveUpdateResponse> {
    await this.emailVerificationService.verify(memberId, input.emailCode);

    const raw = await this.redis.get(`${PENDING_PREFIX}${memberId}`);
    if (!raw) {
      throw new BadRequestException(
        'No pending update found or it has expired. Please start over.',
      );
    }

    const pendingData: { newEmail?: string; newPassword?: string } =
      JSON.parse(raw);

    const updateFields: Record<string, string> = {};
    if (pendingData.newEmail) {
      updateFields.memberEmail = pendingData.newEmail;
    }
    if (pendingData.newPassword) {
      updateFields.memberPassword = pendingData.newPassword;
    }

    const updatedMember = await this.memberModel
      .findByIdAndUpdate(memberId, updateFields, { new: true })
      .exec();

    if (!updatedMember) {
      throw new NotFoundException('Member not found.');
    }

    // 4. Redis dan pending data o'chirish
    await this.redis.del(`${PENDING_PREFIX}${memberId}`);
    const accessToken = await this.authService.createToken(updatedMember);
    this.logger.log(
      `Sensitive update confirmed | ${updatedMember.memberEmail} | fields: ${Object.keys(updateFields).join(', ')}`,
    );
    return {
      message: 'Your account has been updated successfully.',
      accessToken,
    };
  }

  private async findMemberOrThrow(memberId: Types.ObjectId): Promise<Member> {
    const member = await this.memberModel.findById(memberId).exec();
    if (!member) throw new NotFoundException('Member not found.');
    return member;
  }
}
