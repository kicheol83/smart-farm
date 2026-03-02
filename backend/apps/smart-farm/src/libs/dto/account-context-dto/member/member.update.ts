import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class MemberUpdateInput {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberFullName?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberEmail?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberPassword?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberRole?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberAvatar?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberStatus?: string;

  createdAt?: Date;

  updatedAt?: Date;
}
