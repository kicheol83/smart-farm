import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class RoomStats {
  @Field(() => ID)
  greenHouseId: string;

  @Field(() => Int)
  activeConnections: number;

  @Field(() => [String])
  socketIds: string[];
}
