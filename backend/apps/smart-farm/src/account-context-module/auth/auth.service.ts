import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt';
import { shapeIntoMongoObjectId } from '../../libs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { Schema } from 'mongoose';

import { OAuth2Client } from 'google-auth-library';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { EmailVerificationService } from '../email-verifications/email-verifications.service';
import { PasswordResetService } from '../password-reset/password-reset.service';
import { MailService } from '../mail/mail.service';
import { MessageResponse } from '../../libs/dto/auth/auth';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(member: Member): Promise<string> {
    console.log('member:', member);
    const payload: T = {};

    Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
      payload[`${ele}`] = member[`${ele}`];
    });
    delete payload.memberPassword;
    console.log('payload:', payload);
    const result = await this.jwtService.signAsync(payload);
    return result;
  }

  public async verifyToken(token: string): Promise<Member> {
    const member = await this.jwtService.verifyAsync(token);
    member._id = shapeIntoMongoObjectId(member._id);
    return member;
  }

  // Email Verification

  async sendEmailVerificationOtp(
    memberEmail: string,
  ): Promise<MessageResponse> {
    const member = await this.findMemberOrThrow(memberEmail);

    await this.emailVerificationService.checkCooldown(member._id);

    const emailCode = await this.emailVerificationService.generateAndSave(
      member._id,
    );

    // BullMQ → Resend
    await this.mailService.sendEmailVerificationOtp(
      member.memberEmail,
      member.memberFullName,
      emailCode,
    );

    return { message: 'Verification code sent. Check your email.' };
  }

  async verifyEmail(
    memberEmail: string,
    emailCode: string,
  ): Promise<MessageResponse> {
    const member = await this.findMemberOrThrow(memberEmail);

    // EmailVerificationSchema: emailCode, expiresAt, verifiedAt tekshiruvi
    await this.emailVerificationService.verify(member._id, emailCode);

    this.logger.log(`Email verified | ${memberEmail}`);
    return { message: 'Email verified successfully.' };
  }

  // Password Reset

  async forgotPassword(memberEmail: string): Promise<MessageResponse> {
    const member = await this.memberModel
      .findOne({ memberEmail: memberEmail.toLowerCase() })
      .exec();

    // Security: email mavjudligini oshkor qilmaymiz
    if (!member) {
      return { message: 'If this email exists, a reset code has been sent.' };
    }
    await this.passwordResetService.checkCooldown(member._id);
    const passwordToken = await this.passwordResetService.generateAndSave(
      member._id,
    );

    // BullMQ → Resend orqali yuborish
    await this.mailService.sendPasswordResetOtp(
      member.memberEmail,
      member.memberFullName,
      passwordToken,
    );

    return { message: 'If this email exists, a reset code has been sent.' };
  }

  async resetPassword(
    memberEmail: string,
    passwordToken: string,
    newPassword: string,
  ): Promise<MessageResponse> {
    const member = await this.findMemberOrThrow(memberEmail);

    // PasswordResetSchema: passwordToken, expiresAt, usedAt tekshiruvi
    const resetRecord = await this.passwordResetService.verify(
      member._id,
      passwordToken,
    );

    // Yangi parolni hash qilish
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // MemberSchema: memberPassword yangilash
    await this.memberModel.findByIdAndUpdate(member._id, {
      memberPassword: hashedPassword,
    });

    // usedAt belgilash — tokenni bir martali qilish
    await this.passwordResetService.markAsUsed(
      resetRecord._id as Types.ObjectId,
    );

    this.logger.log(`Password reset completed | ${memberEmail}`);
    return { message: 'Password reset successfully.' };
  }

  // ─── Signup OTP

  /**
   * Signup muvaffaqiyatli bo'lgandan keyin chaqiriladi.
   * Member ID va email orqali OTP generatsiya qilib yuboradi.
   * Xato bo'lsa signup ni bloklamaydi — faqat log qiladi.
   */
  public async sendOtpAfterSignup(
    memberId: Types.ObjectId,
    memberEmail: string,
    memberFullName: string,
  ): Promise<void> {
    try {
      const emailCode =
        await this.emailVerificationService.generateAndSave(memberId);
      await this.mailService.sendEmailVerificationOtp(
        memberEmail,
        memberFullName,
        emailCode,
      );
      this.logger.log(`Signup OTP sent | ${memberEmail}`);
    } catch (err) {
      // OTP xatosi signup ni bekor qilmasin 
      this.logger.error(`Signup OTP failed | ${memberEmail} | ${err}`);
    }
  }

  // ─── Private
  private async findMemberOrThrow(memberEmail: string): Promise<Member> {
    const member = await this.memberModel
      .findOne({ memberEmail: memberEmail.toLowerCase() })
      .exec();

    if (!member) {
      throw new NotFoundException(`Member not found: ${memberEmail}`);
    }

    return member;
  }
}
