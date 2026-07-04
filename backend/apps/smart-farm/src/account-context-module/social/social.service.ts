import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import {
  GoogleAuthService,
  GooglePayload,
} from '../google-auth/google-auth.service';
import { SocialAuthResponse } from '../../libs/dto/auth/social';
import { ApplePayload, AppleService } from '../apple/apple.service';

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

  async googleAuth(
    idToken: string,
    createToken: (member: any) => Promise<string>,
  ): Promise<SocialAuthResponse> {
    const payload = await this.googleAuthService.verifyToken(idToken);

    const { member, isNewMember } = await this.findOrCreateByGoogle(payload);

    const accessToken = await createToken(member);

    this.logger.log(
      `Google auth | ${payload.memberEmail} | new=${isNewMember}`,
    );

    return { accessToken, isNewMember };
  }

  async appleAuth(
    identityToken: string,
    fullName: string | undefined,
    createToken: (member: any) => Promise<string>,
  ): Promise<SocialAuthResponse> {
    const payload = await this.appleService.verifyToken(
      identityToken,
      fullName,
    );
    const { member, isNewMember } = await this.findOrCreateByApple(payload);
    const accessToken = await createToken(member);
    this.logger.log(`Apple auth | ${payload.memberEmail} | new=${isNewMember}`);
    return { accessToken, isNewMember };
  }

  private async findOrCreateByGoogle(
    payload: GooglePayload,
  ): Promise<{ member: Member; isNewMember: boolean }> {
    let member = await this.memberModel
      .findOne({ memberEmail: payload.memberEmail.toLowerCase() })
      .exec();

    if (member) {
      if (payload.memberAvatar && !member.memberAvatar) {
        await this.memberModel.findByIdAndUpdate(member._id, {
          memberAvatar: payload.memberAvatar,
        });
      }
      return { member, isNewMember: false };
    }

    member = await this.memberModel.create({
      memberEmail: payload.memberEmail.toLowerCase(),
      memberFullName: payload.memberFullName,
      memberAvatar: payload.memberAvatar,
      memberPassword: this.generateRandomPassword(),
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

  private generateRandomPassword(): string {
    return `social_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
}
