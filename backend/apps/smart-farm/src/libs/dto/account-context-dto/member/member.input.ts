import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { availableManagerSorts, availableMembersSorts } from '../../../config';
import { Direction } from '../../../enums/common.enum';
import { MemberRole, MemberStatus } from '../../../enums/member.enum';
import { Transform } from 'class-transformer';

@InputType()
export class CreateMemberInput {
  @IsNotEmpty()
  @Field(() => String)
  @Length(5, 50)
  memberFullName: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim().toLowerCase())
  @Field(() => String)
  memberEmail: string;

  @IsNotEmpty()
  @Field(() => String)
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one letter and one number',
  })
  memberPassword: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsUrl()
  @Matches(/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/, {
    message: 'Invalid URL format for memberAvatar',
  })
  @MaxLength(200)
  memberAvatar?: string;
}

@InputType()
export class LoginMemberInput {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim().toLowerCase())
  @Field(() => String)
  memberEmail: string;

  @IsNotEmpty()
  @Field(() => String)
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one letter and one number',
  })
  memberPassword: string;
}

@InputType()
export class SignupMemberInput {
  @IsNotEmpty()
  @Field(() => String)
  @Length(5, 50)
  memberFullName: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim().toLowerCase())
  @Field(() => String)
  memberEmail: string;

  @IsNotEmpty()
  @Field(() => String)
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one letter and one number',
  })
  memberPassword: string;
}

@InputType()
class AIsearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class ManagerInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableManagerSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => AIsearch, { nullable: true })
  search?: AIsearch;
}

/** ADMIN  MEMBERS **/
@InputType()
class MIsearch {
  @IsOptional()
  @Field(() => MemberStatus, { nullable: true })
  memberStatus?: MemberStatus;

  @IsOptional()
  @Field(() => MemberRole, { nullable: true })
  memberRole?: MemberRole;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class MembersInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableMembersSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => MIsearch, { nullable: true })
  search?: MIsearch;
}
