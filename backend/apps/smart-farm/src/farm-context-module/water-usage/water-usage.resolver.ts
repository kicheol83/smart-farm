import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WaterUsageService } from './water-usage.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  CreateWaterUsageInput,
  GetWaterAnalyticsInput,
  WaterAnomalyReport,
  WaterCostEstimation,
  WaterEfficiencyReport,
  WaterUsage,
  ZoneUsageReport,
} from '../../libs/dto/farm-context-dto/water-usage/water-usage';

@Resolver(() => WaterUsage)
export class WaterUsageResolver {
  constructor(private readonly waterUsageService: WaterUsageService) {}

  @Mutation(() => WaterUsage, { description: 'Suv sarfini yozish' })
  @UseGuards(AuthGuard)
  async recordWaterUsage(
    @Args('input') input: CreateWaterUsageInput,
  ): Promise<WaterUsage> {
    return this.waterUsageService.create(input) as any;
  }

  @Query(() => [WaterUsage], { description: 'Greenhouse suv sarfi tarixi' })
  @UseGuards(AuthGuard)
  async waterUsageByGreenhouse(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<WaterUsage[]> {
    return this.waterUsageService.findByGreenhouse(greenHouseId, limit) as any;
  }

  @Query(() => WaterEfficiencyReport, {
    description: 'Figma: Water Efficiency Score va h.k.',
  })
  @UseGuards(AuthGuard)
  async waterEfficiencyReport(
    @Args('input') input: GetWaterAnalyticsInput,
  ): Promise<WaterEfficiencyReport> {
    const { from, to } = this.resolveDates(input);
    return this.waterUsageService.getWaterEfficiencyReport(
      input.greenHouseId,
      from,
      to,
    );
  }

  @Query(() => WaterAnomalyReport, { description: 'Figma: Anomaly Detection' })
  @UseGuards(AuthGuard)
  async waterAnomalyDetection(
    @Args('input') input: GetWaterAnalyticsInput,
  ): Promise<WaterAnomalyReport> {
    const { from, to } = this.resolveDates(input);
    return this.waterUsageService.getAnomalyDetection(
      input.greenHouseId,
      from,
      to,
    );
  }

  @Query(() => WaterCostEstimation, { description: 'Figma: Cost Estimation' })
  @UseGuards(AuthGuard)
  async waterCostEstimation(
    @Args('input') input: GetWaterAnalyticsInput,
  ): Promise<WaterCostEstimation> {
    const { from, to } = this.resolveDates(input);
    return this.waterUsageService.getCostEstimation(
      input.greenHouseId,
      from,
      to,
    );
  }

  @Query(() => ZoneUsageReport, {
    description: "Figma: Water Usage Report (zona bo'yicha)",
  })
  @UseGuards(AuthGuard)
  async waterZoneUsageReport(
    @Args('input') input: GetWaterAnalyticsInput,
  ): Promise<ZoneUsageReport> {
    const { from, to } = this.resolveDates(input);
    return this.waterUsageService.getZoneUsageReport(
      input.greenHouseId,
      from,
      to,
    );
  }

  private resolveDates(input: GetWaterAnalyticsInput): {
    from: Date;
    to: Date;
  } {
    const to = input.to ? new Date(input.to) : new Date();
    const from = input.from
      ? new Date(input.from)
      : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to };
  }
}
