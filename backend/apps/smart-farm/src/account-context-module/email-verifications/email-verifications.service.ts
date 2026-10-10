import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document, ObjectId } from 'mongoose';
import { randomInt } from 'crypto';
import { OTP } from '../../libs/types/common';
import { Member } from '../../libs/dto/account-context-dto/member/member';

export interface IEmailVerification extends Document {
  emailCode: string;
  expiresAt: Date;
  verifiedAt?: Date | null;
  memberId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @InjectModel('emailVerifications')
    private readonly emailVerificationModel: Model<IEmailVerification>,
  ) {}

  async generateAndSave(memberId: Types.ObjectId): Promise<string> {
    await this.emailVerificationModel.deleteMany({
      memberId,
      verifiedAt: null,
    });

    const emailCode = this.generateOtp();
    const expiresAt = this.buildExpiresAt();

    await this.emailVerificationModel.create({
      emailCode,
      expiresAt,
      memberId,
      verifiedAt: null,
    });

    this.logger.log(`Email verification OTP saved | memberId=${memberId}`);
    return emailCode;
  }

  async verify(
    memberId: Types.ObjectId,
    emailCode: string,
  ): Promise<Types.ObjectId> {
    const record = await this.emailVerificationModel
      .findOneAndUpdate(
        { memberId, verifiedAt: null, attempts: { $not: { $gte: OTP.MAX_ATTEMPTS } } },
        { $inc: { attempts: 1 } },
        { sort: { createdAt: -1 }, new: true },
      )
      .exec();

    if (!record) {
      throw new BadRequestException(
        'Verification code not found or too many attempts. Please request a new one.',
      );
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new one.',
      );
    }

    if (record.emailCode !== emailCode) {
      throw new BadRequestException('Invalid verification code.');
    }

    record.verifiedAt = new Date();
    await record.save();

    this.logger.log(`Email verified | memberId=${memberId}`);
    return record.memberId;
  }

  public async checkCooldown(memberId: Types.ObjectId): Promise<Member> {
    const last = await this.emailVerificationModel
      .findOne({ memberId, verifiedAt: null })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .exec();

    if (!last) return;

    const secondsAgo = Math.floor(
      (Date.now() - new Date(last.createdAt).getTime()) / 1000,
    );

    if (secondsAgo < OTP.RESEND_COOLDOWN_SECONDS) {
      const wait = OTP.RESEND_COOLDOWN_SECONDS - secondsAgo;
      throw new ConflictException(
        `Please wait ${wait} seconds before requesting a new code.`,
      );
    }
  }

  private generateOtp(): string {
    return String(randomInt(10 ** (OTP.LENGTH - 1), 10 ** OTP.LENGTH));
  }

  private buildExpiresAt(): Date {
    const date = new Date();
    date.setMinutes(date.getMinutes() + OTP.TTL_MINUTES);
    return date;
  }
}
