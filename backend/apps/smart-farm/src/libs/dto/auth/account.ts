import {
  InputType,
  ObjectType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export enum DeleteAccountReason {
  NOT_USING_ANYMORE = 'NOT_USING_ANYMORE',
  PRIVACY_CONCERNS = 'PRIVACY_CONCERNS',
  FOUND_BETTER_APP = 'FOUND_BETTER_APP',
  TOO_MANY_NOTIFICATIONS = 'TOO_MANY_NOTIFICATIONS',
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',
  OTHER = 'OTHER',
}

registerEnumType(DeleteAccountReason, {
  name: 'DeleteAccountReason',
  description: 'Reasons for deleting account',
  valuesMap: {
    NOT_USING_ANYMORE: {
      description: "I don't use this app anymore",
    },
    PRIVACY_CONCERNS: {
      description: 'I have privacy or security concerns',
    },
    FOUND_BETTER_APP: {
      description: 'I found a better alternative',
    },
    TOO_MANY_NOTIFICATIONS: {
      description: 'Too many notifications or emails',
    },
    TECHNICAL_ISSUES: {
      description: 'I experienced too many technical issues',
    },
    OTHER: {
      description: 'Other reason',
    },
  },
});

@InputType()
export class DeleteAccountInput {
  @Field(() => DeleteAccountReason, {
    description: 'Reason for deleting account',
  })
  @IsEnum(DeleteAccountReason, { message: 'Please select a valid reason' })
  @IsNotEmpty({ message: 'reason is required' })
  reason: DeleteAccountReason;

  @Field({
    nullable: true,
    description: 'Additional feedback (required if reason is OTHER)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'feedback must be at most 500 characters' })
  feedback?: string;
}

@ObjectType()
export class MessageRespons {
  @Field()
  message: string;
}

@ObjectType()
export class DeleteReasonOption {
  @Field(() => DeleteAccountReason)
  value: DeleteAccountReason;

  @Field()
  label: string;
}
