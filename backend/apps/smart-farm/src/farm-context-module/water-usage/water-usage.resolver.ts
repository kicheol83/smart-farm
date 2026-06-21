import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WaterUsageService } from './water-usage.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  CreateWaterUsageInput,
  WaterUsage,
} from '../../libs/dto/farm-context-dto/water-usage/water-usage';

@Resolver(() => WaterUsage)
export class WaterUsageResolver {
  constructor(private readonly waterUsageService: WaterUsageService) {}

  @Mutation(() => WaterUsage)
  @UseGuards(AuthGuard)
  public async recordWaterUsage(
    @Args('input') input: CreateWaterUsageInput,
  ): Promise<WaterUsage> {
    const result = await this.waterUsageService.create(input);
    return result as any;
  }

  @Query(() => [WaterUsage])
  @UseGuards(AuthGuard)
  public async waterUsageByGreenhouse(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<WaterUsage[]> {
    const result = await this.waterUsageService.findByGreenhouse(
      greenHouseId,
      limit,
    );
    return result as any;
  }

  @Query(() => [WaterUsage])
  @UseGuards(AuthGuard)
  public async waterUsageByDateRange(
    @Args('greenHouseId', { type: () => ID })
    greenHouseId: string,
    @Args('from', { type: () => GraphQLISODateTime })
    from: Date,
    @Args('to', { type: () => GraphQLISODateTime })
    to: Date,
  ): Promise<WaterUsage[]> {
    const result = await this.waterUsageService.findByDateRange(
      greenHouseId,
      from,
      to,
    );
    return result as any;
  }
}
