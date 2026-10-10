import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CropsService } from './crops.service';
import {
  CreateCropsInput,
  Crops,
  UpdateCropsInput,
} from '../../libs/dto/farm-context-dto/crops/crops';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

import { MemberRole } from '../../libs/enums/member.enum';
import { RolesGuard } from '../../account-context-module/auth/guards/roles.guard';
import { Roles } from '../../account-context-module/auth/decorators/roles.decorator';
@Resolver(() => Crops)
export class CropsResolver {
  constructor(private readonly cropsService: CropsService) {}

  @Mutation(() => Crops)
  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  public async createCrop(
    @Args('input') input: CreateCropsInput,
  ): Promise<Crops> {
    console.log('Mutation: createCrop');
    const result = (await this.cropsService.create(input)) as any;
    return result;
  }

  @Query(() => [Crops])
  @UseGuards(AuthGuard)
  public async crops(): Promise<Crops[]> {
    console.log('Query: crops');
    const result = (await this.cropsService.findAll()) as any;
    return result;
  }

  @Query(() => Crops)
  @UseGuards(AuthGuard)
  public async crop(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Crops> {
    console.log('Query: crop');
    const result = (await this.cropsService.findOne(id)) as any;
    return result;
  }

  @Mutation(() => Crops)
  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  public async updateCrop(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCropsInput,
  ): Promise<Crops> {
    console.log('Mutation: updateCrop');
    const result = (await this.cropsService.update(id, input)) as any;
    return result;
  }

  @Mutation(() => Boolean)
  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  public async deleteCrop(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    console.log('Mutation: deleteCrop');
    const result = await this.cropsService.remove(id);
    return result;
  }
}
