import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PlantHealthMonitoringService } from './plant-health-monitoring.service';
import {
  GetSectionHealthTrendInput,
  GreenhousePlantHealthOverview,
  RecordSectionHealthInput,
  SectionHealthTrend,
  SectionPlantHealth,
} from '../../libs/dto/farm-context-dto/plant-health/plant-health-monitoring';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

@Resolver()
export class PlantHealthMonitoringResolver {
  constructor(
    private readonly plantHealthMonitoringService: PlantHealthMonitoringService,
  ) {}

  @Mutation(() => SectionPlantHealth)
  @UseGuards(AuthGuard)
  public async recordSectionHealth(
    @Args('input') input: RecordSectionHealthInput,
  ): Promise<SectionPlantHealth> {
    const result = this.plantHealthMonitoringService.record(input);
    return result;
  }

  @Query(() => SectionHealthTrend)
  @UseGuards(AuthGuard)
  public async sectionHealthTrend(
    @Args('input') input: GetSectionHealthTrendInput,
  ): Promise<SectionHealthTrend> {
    const result = this.plantHealthMonitoringService.getSectionTrend(input);
    return result;
  }

  @Query(() => GreenhousePlantHealthOverview)
  @UseGuards(AuthGuard)
  public async greenhousePlantHealthOverview(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<GreenhousePlantHealthOverview> {
    const result =
      this.plantHealthMonitoringService.getGreenhouseOverview(greenHouseId);
    return result;
  }
}
