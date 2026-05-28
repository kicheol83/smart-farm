import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Member,
  Members,
} from '../../libs/dto/account-context-dto/member/member';
import { Model, ObjectId } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import {
  CreateMemberInput,
  LoginMemberInput,
  ManagerInquiry,
  MembersInquiry,
} from '../../libs/dto/account-context-dto/member/member.input';
import { Message, T } from '../../libs/types/common';
import { MemberRole, MemberStatus } from '../../libs/enums/member.enum';
import { MemberUpdateInput } from '../../libs/dto/account-context-dto/member/member.update';
import { Direction } from '../../libs/enums/common.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<Member>,
    private authService: AuthService,
  ) {}

  public async signup(input: CreateMemberInput): Promise<Member> {
    input.memberPassword = await this.authService.hashPassword(
      input.memberPassword,
    );
    try {
      const result = await this.memberModel.create(input);
      result.accessToken = await this.authService.createToken(result);

      await this.authService.sendOtpAfterSignup(
        result._id,
        result.memberEmail,
        result.memberFullName,
      );

      return result;
    } catch (err) {
      console.log('Error signup', err);
      throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
    }
  }

  public async login(input: LoginMemberInput): Promise<Member> {
    const { memberEmail, memberPassword } = input;

    const response = await this.memberModel
      .findOne({ memberEmail })
      .select('+memberPassword')
      .exec();

    if (!response || response.memberStatus === MemberStatus.DELETE) {
      throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
    } else if (response.memberStatus === MemberStatus.BLOCK) {
      throw new InternalServerErrorException(Message.BLOCKED_USER);
    } else if (response.memberStatus === MemberStatus.SUSPENDED) {
      throw new InternalServerErrorException(Message.DEVICE_ALREADY_REGISTERED);
    } else if (response.memberStatus === MemberStatus.INACTIVE) {
      throw new InternalServerErrorException(Message.DEVICE_ALREADY_REGISTERED);
    }

    const isMatch = await this.authService.comparePassword(
      memberPassword,
      response.memberPassword,
    );

    if (!isMatch) {
      throw new InternalServerErrorException(Message.WRONG_PASSWORD);
    }

    response.accessToken = await this.authService.createToken(response);

    return response;
  }

  public async updateMember(
    memberId: ObjectId,
    input: MemberUpdateInput,
  ): Promise<Member> {
    if (input.memberPassword) {
      input.memberPassword = await bcrypt.hash(input.memberPassword, 10);
    }

    const result: Member = await this.memberModel
      .findOneAndUpdate(
        { _id: memberId, memberStatus: MemberStatus.ACTIVE },
        input,
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    result.accessToken = await this.authService.createToken(result);
    return result;
  }

  public async getMember(
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<Member> {
    const search: T = {
      _id: targetId,
      memberStatus: {
        $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
      },
    };
    const targetMember = await this.memberModel.findOne(search).exec();
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return targetMember;
  }

  public async getManagerMember(
    memberId: ObjectId,
    input: ManagerInquiry,
  ): Promise<Members> {
    const { text } = input.search;
    const match: T = {
      memberRole: MemberRole.WORKER,
      memberStatus: MemberStatus.ACTIVE,
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    if (text) match.memberFullName = { $regex: new RegExp(text, 'i') };
    console.log('match:', match);
    console.log('sort:', sort);

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    console.log('result:', result);
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
    const { memberStatus, memberRole, text } = input.search;
    const match: T = {};
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    if (memberStatus) match.memberStatus = memberStatus;
    if (memberRole) match.memberRole = memberRole;
    if (text) match.memberFullName = { $regex: new RegExp(text, 'i') };
    console.log('match:', match);

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    console.log('page:', input.page);
    console.log('limit:', input.limit);
    console.log('result:', result);

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async updateMemberByAdmin(input: MemberUpdateInput): Promise<Member> {
    const result: Member = await this.memberModel
      .findOneAndUpdate({ _id: input._id }, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }
}
