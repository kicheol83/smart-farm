import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class MemberProfileUpdateInput {
  @IsOptional()
  @Length(5, 50)
  @Field(() => String, { nullable: true })
  memberFullName?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(200)
  @Field(() => String, { nullable: true })
  memberAvatar?: string;
}

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
