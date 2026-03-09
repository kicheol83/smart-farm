import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { MemberStatus } from '../../../enums/member.enum';

@ObjectType()
export class Member {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  memberFullName: string;

  @Field(() => String)
  memberEmail: string;

  memberPassword: string;

  @Field(() => String)
  memberRole: string;

  @Field(() => String, { nullable: true })
  memberAvatar?: string;

  @Field(() => MemberStatus)
  memberStatus: MemberStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  accessToken?: string;
}

@ObjectType()
export class TotalCounter {
  @Field(() => Int, { nullable: true })
  total?: number;
}

@ObjectType()
export class Members {
  @Field(() => [Member])
  list: Member[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;
}
