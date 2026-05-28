import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { OTP } from '../../libs/types/common';
import { Member } from '../../libs/dto/account-context-dto/member/member';

// PasswordResetSchema ga mos interface
export interface IPasswordReset extends Document {
  passwordToken: string;
  expiresAt: Date;
  usedAt?: Date | null;
  memberId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectModel('passwordReset')
    private readonly passwordResetModel: Model<IPasswordReset>,
  ) {}

  /**
   * Yangi 6 xonali OTP generatsiya qilib MongoDB ga saqlaydi.
   * Avvalgi ishlatilmagan tokenlarni o'chiradi.
   * Generatsiya qilingan tokenni qaytaradi.
   */
  async generateAndSave(memberId: Types.ObjectId): Promise<string> {
    // Avvalgi ishlatilmagan tokenlarni tozalash
    await this.passwordResetModel.deleteMany({
      memberId,
      usedAt: null,
    });

    const passwordToken = this.generateOtp();
    const expiresAt = this.buildExpiresAt();

    await this.passwordResetModel.create({
      passwordToken,
      expiresAt,
      memberId,
      usedAt: null,
    });

    this.logger.log(`Password reset OTP saved | memberId=${memberId}`);
    return passwordToken;
  }

  /**
   * passwordToken ni tekshiradi.
   * To'g'ri bo'lsa record ni qaytaradi — markAsUsed uchun kerak.
   */
  async verify(
    memberId: Types.ObjectId,
    passwordToken: string,
  ): Promise<IPasswordReset> {
    const record = await this.passwordResetModel
      .findOne({ memberId, usedAt: null })
      .sort({ createdAt: -1 })
      .exec();

    if (!record) {
      throw new BadRequestException(
        'Reset code not found. Please request a new one.',
      );
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Reset code has expired. Please request a new one.',
      );
    }

    if (record.passwordToken !== passwordToken) {
      throw new BadRequestException('Invalid reset code.');
    }

    return record;
  }

  /**
   * Tokenni bir martalik qilish uchun usedAt ni belgilaydi.
   * resetPassword dan keyin chaqiriladi.
   */
  async markAsUsed(recordId: Types.ObjectId): Promise<void> {
    await this.passwordResetModel.findByIdAndUpdate(recordId, {
      usedAt: new Date(),
    });
    this.logger.log(`Password reset token marked as used | id=${recordId}`);
  }

  /**
   * 60 soniyada bir marta yuborish chegarasi.
   */
  async checkCooldown(memberId: Types.ObjectId): Promise<Member> {
    const last = await this.passwordResetModel
      .findOne({ memberId, usedAt: null })
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

  // ─── Private helpers
  private generateOtp(): string {
    const min = 10 ** (OTP.LENGTH - 1); // 100000
    const max = 10 ** OTP.LENGTH - 1; // 999999
    const result = String(Math.floor(min + Math.random() * (max - min + 1)));
    return result;
  }

  private buildExpiresAt(): Date {
    const date = new Date();
    date.setMinutes(date.getMinutes() + OTP.TTL_MINUTES);
    return date;
  }
}
