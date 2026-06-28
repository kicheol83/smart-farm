import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../account-context-module/auth/guards/auth.guard';
import { RolesGuard } from '../account-context-module/auth/guards/roles.guard';
import { Roles } from '../account-context-module/auth/decorators/roles.decorator';
import { MemberRole } from '../libs/enums/member.enum';
import {
  AdminMemberView,
  GetAdminMembersInput,
  GetDeviceHealthInput,
  GetGrowthTrendInput,
  GlobalStats,
  MemberGrowthTrend,
  PaginatedAdminMembers,
  PaginatedDeviceHealth,
  SystemAlertOverview,
  UpdateMemberRoleInput,
  UpdateMemberStatusInput,
} from '../libs/dto/admin-dtos/admin';

@Resolver()
@UseGuards(AuthGuard, RolesGuard)
@Roles(MemberRole.ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => GlobalStats)
  public async adminGlobalStats(): Promise<GlobalStats> {
    return this.adminService.getGlobalStats();
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => MemberGrowthTrend)
  public async adminMemberGrowthTrend(
    @Args('input') input: GetGrowthTrendInput,
  ): Promise<MemberGrowthTrend> {
    return this.adminService.getMemberGrowthTrend(input);
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => PaginatedAdminMembers)
  public async adminMembers(
    @Args('input') input: GetAdminMembersInput,
  ): Promise<PaginatedAdminMembers> {
    return this.adminService.getMembers(input);
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => AdminMemberView)
  public async adminMemberDetail(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<AdminMemberView> {
    return this.adminService.getMemberDetail(memberId);
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => AdminMemberView)
  public async adminUpdateMemberRole(
    @Args('input') input: UpdateMemberRoleInput,
  ): Promise<AdminMemberView> {
    return this.adminService.updateMemberRole(input);
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => AdminMemberView)
  public async adminUpdateMemberStatus(
    @Args('input') input: UpdateMemberStatusInput,
  ): Promise<AdminMemberView> {
    return this.adminService.updateMemberStatus(input);
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Boolean)
  public async adminDeleteMember(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<boolean> {
    return this.adminService.deleteMember(memberId);
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => PaginatedDeviceHealth)
  public async adminDeviceHealth(
    @Args('input') input: GetDeviceHealthInput,
  ): Promise<PaginatedDeviceHealth> {
    return this.adminService.getDeviceHealthOverview(input);
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => [SystemAlertOverview])
  public async adminSystemAlerts(
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<SystemAlertOverview[]> {
    return this.adminService.getSystemAlerts(limit);
  }
}
