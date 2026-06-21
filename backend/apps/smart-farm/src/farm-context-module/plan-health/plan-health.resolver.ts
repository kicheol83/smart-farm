import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { IPlantHealth, PlanHealthService } from './plan-health.service';
import {
  CreatePlantHealthInput,
  PlantHealth,
} from '../../libs/dto/farm-context-dto/plant-health/plant-health';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

@Resolver(() => PlantHealth)
export class PlanHealthResolver {
  constructor(private readonly plantHealthService: PlanHealthService) {}

  @Mutation(() => PlantHealth)
  @UseGuards(AuthGuard)
  public async recordPlantHealth(
    @Args('input') input: CreatePlantHealthInput,
  ): Promise<PlantHealth> {
    const result = await this.plantHealthService.create(input);
    return result as any;
  }

  @Query(() => [PlantHealth])
  @UseGuards(AuthGuard)
  public async plantHealthByField(
    @Args('fieldsId', { type: () => ID }) fieldsId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<PlantHealth[]> {
    const result = await this.plantHealthService.findByField(fieldsId, limit);
    return result as any;
  }

  @Query(() => PlantHealth, { nullable: true })
  @UseGuards(AuthGuard)
  public async latestPlantHealth(
    @Args('fieldsId', { type: () => ID }) fieldsId: string,
  ): Promise<PlantHealth | null> {
    const result = await this.plantHealthService.findLatest(fieldsId);
    return result as any;
  }

  @Query(() => [PlantHealth])
  @UseGuards(AuthGuard)
  public async plantHealthHistory(
    @Args('fieldsId', { type: () => ID }) fieldsId: string,
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<PlantHealth[]> {
    const result = await this.plantHealthService.findByDateRange(
      fieldsId,
      new Date(from),
      new Date(to),
    );
    return result as any;
  }
}
