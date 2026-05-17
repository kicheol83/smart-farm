import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { AuthService } from '../auth/auth.service';
import {
  Member,
  Members,
} from '../../libs/dto/account-context-dto/member/member';
import {
  CreateMemberInput,
  LoginMemberInput,
  ManagerInquiry,
  MembersInquiry,
} from '../../libs/dto/account-context-dto/member/member.input';
import { ObjectId } from 'mongoose';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { MemberUpdateInput } from '../../libs/dto/account-context-dto/member/member.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberRole } from '../../libs/enums/member.enum';

@Resolver()
export class MemberResolver {
  constructor(
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => Member)
  public async signup(
    @Args('input') input: CreateMemberInput,
  ): Promise<Member> {
    console.log('Mutation: signup');
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  public async login(@Args('input') input: LoginMemberInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }

  /** Autentacited */
  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdateInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('Mutation: updateMember');
    delete input._id;
    return await this.memberService.updateMember(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Member)
  public async getMember(
    @Args('memberId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('Mutation: getMember');
    const targetId = shapeIntoMongoObjectId(input);
    return await this.memberService.getMember(memberId, targetId);
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(
    @AuthMember('memberFullName') memberFullName: string,
  ): Promise<string> {
    console.log('Query: checkAuth');
    console.log('memberFullName =>', memberFullName);
    return `hi ${memberFullName}`;
  }

  @Roles(MemberRole.MANAGER, MemberRole.WORKER)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(
    @AuthMember() authMember: Member,
  ): Promise<string> {
    console.log('Query: checkAuthRoles');
    return `hi ${authMember.memberFullName}, you are ${authMember.memberRole} (memberId: ${authMember._id})`;
  }

  @Roles(MemberRole.MANAGER)
  @Query(() => Members)
  public async getManagerMember(
    @Args('input') input: ManagerInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Members> {
    console.log('Query: getManagerMember');
    return await this.memberService.getManagerMember(memberId, input);
  }

  /**  ADMIN  **/

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Members)
  public async getAllMembersByAdmin(
    @Args('input') input: MembersInquiry,
  ): Promise<Members> {
    console.log('Query: getAllMembersByAdmin');
    return await this.memberService.getAllMembersByAdmin(input);
  }
}
