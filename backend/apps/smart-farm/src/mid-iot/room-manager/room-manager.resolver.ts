import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { RoomManagerService } from './room-manager.service';
import { RoomStats } from '../../libs/dto/mid-iot/room-manager';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../account-context-module/auth/guards/roles.guard';
import { Roles } from '../../account-context-module/auth/decorators/roles.decorator';
import { MemberRole } from '../../libs/enums/member.enum';

@Resolver()
@UseGuards(RolesGuard)
@Roles(MemberRole.ADMIN)
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
