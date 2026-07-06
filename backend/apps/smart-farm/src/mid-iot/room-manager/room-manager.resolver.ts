import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { RoomManagerService } from './room-manager.service';
import { RoomStats } from '../../libs/dto/mid-iot/room-manager';

@Resolver()
export class RoomManagerResolver {
  constructor(private readonly roomManager: RoomManagerService) {}

  @Query(() => RoomStats)
  async roomStats(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<RoomStats> {
    return this.roomManager.getRoomStats(greenHouseId);
  }

  @Query(() => [RoomStats])
  async allRoomStats(): Promise<RoomStats[]> {
    return this.roomManager.getAllRoomStats();
  }
}
