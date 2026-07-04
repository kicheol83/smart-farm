import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BufferStats {
  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  deadLetter: number;
}

@ObjectType()
export class DeadLetterMessage {
  @Field()
  id: string;

  @Field()
  topic: string;

  @Field()
  payload: string;

  @Field()
  receivedAt: string;

  @Field(() => Int)
  retryCount: number;

  @Field({ nullable: true })
  failReason?: string;
}
