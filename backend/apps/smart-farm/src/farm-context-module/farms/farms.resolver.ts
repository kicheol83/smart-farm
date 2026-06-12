import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { FarmsService } from './farms.service';
import {
  CreateFarmInput,
  Farm,
  UpdateFarmInput,
} from '../../libs/dto/farm-context-dto/farms/farm';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { CurrentUser } from '../../libs/types/decorators/current.user';
import { JwtPayload } from '../../account-context-module/auth/decorators/currentUser.decorator';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';

@Resolver(() => Farm)
export class FarmsResolver {
  constructor(private readonly farmService: FarmsService) {}

  @Mutation(() => Farm)
  @UseGuards(AuthGuard)
  public async createFarm(
    @AuthMember() user: Member,
    @Args('input') input: CreateFarmInput,
  ): Promise<Farm> {
    console.log('Mutation: createFarm');

    const result = this.farmService.create(
      new Types.ObjectId(user._id),
      input,
    ) as any;

    console.log('Created Farm:', result);

    return result;
  }

  @Query(() => [Farm])
  @UseGuards(AuthGuard)
  public async myFarms(@AuthMember() member: Member): Promise<Farm[]> {
    console.log('Query: myFarms');
    const result = this.farmService.findAll(
      new Types.ObjectId(member._id),
    ) as any;
    return result;
  }

  @Query(() => Farm)
  @UseGuards(AuthGuard)
  public async farm(
    @AuthMember() member: Member,
    @Args('farmId', { type: () => ID }) farmId: string,
  ): Promise<Farm> {
    console.log('Query: farm');
    const result = this.farmService.findOne(
      farmId,
      new Types.ObjectId(member._id),
    ) as any;
    return result;
  }

  @Mutation(() => Farm)
  @UseGuards(AuthGuard)
  public async updateFarm(
    @AuthMember() member: Member,
    @Args('farmId', { type: () => ID }) farmId: string,
    @Args('input') input: UpdateFarmInput,
  ): Promise<Farm> {
    console.log('Mutation: updateFarm');
    const result = this.farmService.update(
      farmId,
      new Types.ObjectId(member._id),
      input,
    ) as any;
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  public async deleteFarm(
    @AuthMember() member: Member,
    @Args('farmId', { type: () => ID }) farmId: string,
  ): Promise<boolean> {
    console.log('Mutation: deleteFarm');
    const result = this.farmService.remove(
      farmId,
      new Types.ObjectId(member._id),
    );
    return result;
  }
}
