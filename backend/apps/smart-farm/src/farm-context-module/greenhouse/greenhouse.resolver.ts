import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GreenhouseService } from './greenhouse.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  CreateGreenhouseInput,
  Greenhouse,
  UpdateGreenhouseInput,
} from '../../libs/dto/farm-context-dto/greenhouse/greenhouse';

@Resolver(() => Greenhouse)
export class GreenhouseResolver {
  constructor(private readonly greenhouseService: GreenhouseService) {}

  @Mutation(() => Greenhouse)
  @UseGuards(AuthGuard)
  public async createGreenhouse(
    @Args('input') input: CreateGreenhouseInput,
  ): Promise<Greenhouse> {
    const result = await this.greenhouseService.create(input) as any;
    return result;
  }

  @Query(() => [Greenhouse])
  @UseGuards(AuthGuard)
  public async greenhousesByFarm(
    @Args('farmsId', { type: () => ID }) farmsId: string,
  ): Promise<Greenhouse[]> {
    const result = await this.greenhouseService.findByFarm(farmsId) as any;
    return result;
  }

  @Query(() => Greenhouse)
  @UseGuards(AuthGuard)
  public async greenhouse(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Greenhouse> {
    const result = await this.greenhouseService.findOne(id) as any;
    return result;
  }

  @Mutation(() => Greenhouse)
  @UseGuards(AuthGuard)
  public async updateGreenhouse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGreenhouseInput,
  ): Promise<Greenhouse> {
    const result = await this.greenhouseService.update(id, input) as any;
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  public async deleteGreenhouse(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.greenhouseService.remove(id) as any;
    return result;
  }
}
