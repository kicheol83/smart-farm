import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import {
  CreateMemberInput,
  LoginMemberInput,
} from '../../libs/dto/account-context-dto/member/member.input';
import { Message } from '../../libs/types/common';
import { MemberStatus } from '../../libs/enums/member.enum';

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

      return result;
    } catch (err) {
      console.log('Error signup', err.meessage);
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
}
