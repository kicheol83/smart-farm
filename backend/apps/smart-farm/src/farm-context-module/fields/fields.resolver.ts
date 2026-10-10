import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreateFieldInput,
  FieldEntity,
  UpdateFieldInput,
} from '../../libs/dto/farm-context-dto/fields/field';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { FieldsService } from './fields.service';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';
import { OwnedBy } from '../../ownership/owned-by.decorator';
import { OwnershipService } from '../../ownership/ownership.service';
import { MemberRole } from '../../libs/enums/member.enum';

@Resolver(() => FieldEntity)
export class FieldsResolver {
  constructor(
    private readonly fieldService: FieldsService,
    private readonly ownershipService: OwnershipService,
  ) {}

  private async visibleSections(member: { _id: unknown; memberRole: string }) {
    return member.memberRole === MemberRole.ADMIN
      ? undefined
      : this.ownershipService.ownedSectionIds(String(member._id));
  }

  @Mutation(() => FieldEntity)
  @UseGuards(AuthGuard)
  public async createField(
    @Args('input') input: CreateFieldInput,
  ): Promise<FieldEntity> {
    console.log('Mutation: createField');
    const result = await this.fieldService.create(input);
    return result as any;
  }

  @Query(() => [FieldEntity])
  @UseGuards(AuthGuard)
  public async fields(@AuthMember() member: any): Promise<FieldEntity[]> {
    console.log('Query: fields');
    const result = await this.fieldService.findAll(await this.visibleSections(member));
    return result as any;
  }

  @Query(() => FieldEntity)
  @UseGuards(AuthGuard)
  @OwnedBy('field')
  public async field(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<FieldEntity> {
    console.log('Query: field');
    const result = await this.fieldService.findOne(id);
    return result as any;
  }

  @Query(() => [FieldEntity])
  @UseGuards(AuthGuard)
  public async fieldsByCrop(
    @Args('cropsId', { type: () => ID }) cropsId: string,
    @AuthMember() member: any,
  ): Promise<FieldEntity[]> {
    console.log('Query: fieldsByCrop');
    const result = await this.fieldService.findByCrop(
      cropsId,
      await this.visibleSections(member),
    );
    return result as any;
  }

  @Mutation(() => FieldEntity)
  @UseGuards(AuthGuard)
  @OwnedBy('field')
  public async updateField(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFieldInput,
  ): Promise<FieldEntity> {
    console.log('Mutation: updateField');
    const result = await this.fieldService.update(id, input);
    return result as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @OwnedBy('field')
  public async deleteField(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    console.log('Mutation: deleteField');
    const result = await this.fieldService.remove(id);
    return result;
  }
}
