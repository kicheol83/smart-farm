import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { AuthService } from '../auth/auth.service';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { CreateMemberInput, LoginMemberInput } from '../../libs/dto/account-context-dto/member/member.input';

@Resolver()
export class MemberResolver {
  constructor(
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => Member)
  public async signup(@Args('input') input: CreateMemberInput): Promise<Member> {
    console.log('Mutation: signup');
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  public async login(@Args('input') input: LoginMemberInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }
}
