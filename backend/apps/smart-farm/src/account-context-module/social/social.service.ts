import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { GoogleAuthService, GooglePayload } from '../google-auth/google-auth.service';
import { SocialAuthResponse } from '../../libs/dto/auth/social';
import { ApplePayload, AppleService } from '../apple/apple.service';

// AuthService dan createToken import qilish uchun interface
export interface ITokenCreator {
  createToken(member: any): Promise<string>;
}

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    @InjectModel('Member')
    private readonly memberModel: Model<Member>,

    private readonly googleAuthService: GoogleAuthService,
    private readonly appleService: AppleService,
  ) {}

  /**
   * Google idToken bilan login yoki register.
   *
   * mutation {
   *   googleAuth(input: { idToken: "eyJ..." }) {
   *     accessToken
   *     isNewMember
   *   }
   * }
   */
  async googleAuth(
    idToken: string,
    createToken: (member: any) => Promise<string>,
  ): Promise<SocialAuthResponse> {
    // 1. Google token verify
    const payload = await this.googleAuthService.verifyToken(idToken);

    // 2. Member topish yoki yaratish
    const { member, isNewMember } = await this.findOrCreateByGoogle(payload);

    // 3. JWT token yaratish
    const accessToken = await createToken(member);

    this.logger.log(
      `Google auth | ${payload.memberEmail} | new=${isNewMember}`,
    );

    return { accessToken, isNewMember };
  }

  /**
   * Apple identityToken bilan login yoki register.
   *
   * mutation {
   *   appleAuth(input: { identityToken: "eyJ...", fullName: "John Doe" }) {
   *     accessToken
   *     isNewMember
   *   }
   * }
   */
  async appleAuth(
    identityToken: string,
    fullName: string | undefined,
    createToken: (member: any) => Promise<string>,
  ): Promise<SocialAuthResponse> {
    // 1. Apple token verify
    const payload = await this.appleService.verifyToken(
      identityToken,
      fullName,
    );

    // 2. Member topish yoki yaratish
    const { member, isNewMember } = await this.findOrCreateByApple(payload);

    // 3. JWT token yaratish
    const accessToken = await createToken(member);

    this.logger.log(`Apple auth | ${payload.memberEmail} | new=${isNewMember}`);

    return { accessToken, isNewMember };
  }

  // ─── Private: Member topish yoki yaratish ────────────────────────────────

  private async findOrCreateByGoogle(
    payload: GooglePayload,
  ): Promise<{ member: Member; isNewMember: boolean }> {
    // Avval email bilan topamiz
    let member = await this.memberModel
      .findOne({ memberEmail: payload.memberEmail.toLowerCase() })
      .exec();

    if (member) {
      // Mavjud member — avatar yangilash (Google rasmini saqlash)
      if (payload.memberAvatar && !member.memberAvatar) {
        await this.memberModel.findByIdAndUpdate(member._id, {
          memberAvatar: payload.memberAvatar,
        });
      }
      return { member, isNewMember: false };
    }

    // Yangi member yaratish
    member = await this.memberModel.create({
      memberEmail: payload.memberEmail.toLowerCase(),
      memberFullName: payload.memberFullName,
      memberAvatar: payload.memberAvatar,
      memberPassword: this.generateRandomPassword(), // social login uchun random parol
      memberRole: 'WORKER',
      memberStatus: 'ACTIVE',
    });

    return { member, isNewMember: true };
  }

  private async findOrCreateByApple(
    payload: ApplePayload,
  ): Promise<{ member: Member; isNewMember: boolean }> {
    let member = await this.memberModel
      .findOne({ memberEmail: payload.memberEmail.toLowerCase() })
      .exec();

    if (member) {
      return { member, isNewMember: false };
    }

    // Yangi member yaratish
    member = await this.memberModel.create({
      memberEmail: payload.memberEmail.toLowerCase(),
      memberFullName: payload.memberFullName,
      memberAvatar: '',
      memberPassword: this.generateRandomPassword(),
      memberRole: 'WORKER',
      memberStatus: 'ACTIVE',
    });

    return { member, isNewMember: true };
  }

  // Random parol — social login da parol kerak emas
  // lekin MemberSchema da required: true bo'lgani uchun yoziladi
  private generateRandomPassword(): string {
    return `social_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
}
