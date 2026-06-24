import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NdviService } from './ndvi.service';
import {
  NdviRecord,
  RecordNdviInput,
  SectorNdviTrend,
} from '../../libs/dto/farm-context-dto/ndvi/ndvi';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

@Resolver()
export class NdviResolver {
  constructor(private readonly ndviService: NdviService) {}

  @Mutation(() => NdviRecord)
  @UseGuards(AuthGuard)
  public async recordNdvi(
    @Args('input') input: RecordNdviInput,
  ): Promise<NdviRecord> {
    const result = await this.ndviService.record(input);
    return result;
  }

  @Query(() => SectorNdviTrend)
  @UseGuards(AuthGuard)
  public async sectorNdviTrend(
    @Args('sectorId', { type: () => ID }) sectorId: string,
    @Args('from', { nullable: true }) from?: string,
    @Args('to', { nullable: true }) to?: string,
  ): Promise<SectorNdviTrend> {
    const result = await this.ndviService.getSectorTrend(
      sectorId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return result;
  }

  @Query(() => [NdviRecord])
  @UseGuards(AuthGuard)
  public async fieldNdviHistory(
    @Args('fieldId', { type: () => ID }) fieldId: string,
    @Args('from', { nullable: true }) from?: string,
    @Args('to', { nullable: true }) to?: string,
  ): Promise<NdviRecord[]> {
    const result = await this.ndviService.getFieldNdviHistory(
      fieldId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return result;
  }
}
