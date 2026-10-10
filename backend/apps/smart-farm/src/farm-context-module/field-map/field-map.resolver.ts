import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FieldMapService } from './field-map.service';
import {
  FieldMap,
  MapSector,
  FieldNdviMap,
  FieldMapAnalytics,
  CreateFieldMapInput,
  CreateSectorInput,
  UpdateSectorInput,
  UpdateNdviInput,
  UpdateFieldMapInput,
} from '../../libs/dto/farm-context-dto/fields/fields-map';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

import { OwnedArgs, OwnedBy } from '../../ownership/owned-by.decorator';
@Resolver()
export class FieldMapResolver {
  constructor(private readonly fieldMapService: FieldMapService) {}

  @Mutation(() => FieldMap, { description: 'Field xaritasi yaratish' })
  @UseGuards(AuthGuard)
  public async createFieldMap(
    @Args('input') input: CreateFieldMapInput,
  ): Promise<FieldMap> {
    const result = (await this.fieldMapService.createFieldMap(input)) as any;
    return result;
  }

  @Mutation(() => FieldMap, { description: 'Field xaritasi yangilash' })
  @UseGuards(AuthGuard)
  @OwnedBy('fieldMap')
  public async updateFieldMap(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFieldMapInput,
  ): Promise<FieldMap> {
    const result = (await this.fieldMapService.updateFieldMap(
      id,
      input,
    )) as any;
    return result;
  }

  @Mutation(() => Boolean, { description: "Field xaritasi o'chirish" })
  @UseGuards(AuthGuard)
  @OwnedBy('fieldMap')
  public async deleteFieldMap(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.fieldMapService.removeFieldMap(id);
    return result;
  }

  @Mutation(() => MapSector, {
    description: "Figma: Add Sector Modal — yangi sector qo'shish",
  })
  @UseGuards(AuthGuard)
  @OwnedArgs({ 'input.fieldId': 'fieldMap' })
  public async createSector(
    @Args('input') input: CreateSectorInput,
  ): Promise<MapSector> {
    const result = (await this.fieldMapService.createSector(input)) as any;
    return result;
  }

  @Mutation(() => MapSector, { description: 'Sector yangilash' })
  @UseGuards(AuthGuard)
  @OwnedBy('sector')
  public async updateSector(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSectorInput,
  ): Promise<MapSector> {
    const result = (await this.fieldMapService.updateSector(id, input)) as any;
    return result;
  }

  @Mutation(() => Boolean, { description: "Sector o'chirish" })
  @UseGuards(AuthGuard)
  @OwnedBy('sector')
  public async deleteSector(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.fieldMapService.removeSector(id);
    return result;
  }

  @Mutation(() => MapSector, { description: 'Sector NDVI yangilash' })
  @UseGuards(AuthGuard)
  public async updateSectorNdvi(
    @Args('input') input: UpdateNdviInput,
  ): Promise<MapSector> {
    const result = (await this.fieldMapService.updateSectorNdvi(input)) as any;
    return result;
  }

  @Query(() => [FieldMap], { description: "Farm bo'yicha field xaritalari" })
  @UseGuards(AuthGuard)
  public async fieldMapsByFarm(
    @Args('farmId', { type: () => ID }) farmId: string,
  ): Promise<FieldMap[]> {
    const result = (await this.fieldMapService.findFieldMapsByFarm(
      farmId,
    )) as any;
    return result;
  }

  @Query(() => FieldMap, {
    description: 'Figma: Map Area — field xaritasi barcha sectorlar bilan',
  })
  @UseGuards(AuthGuard)
  @OwnedArgs({ fieldId: 'fieldMap' })
  public async fieldMapWithSectors(
    @Args('fieldId', { type: () => ID }) fieldId: string,
  ): Promise<FieldMap> {
    const result = await this.fieldMapService.getFieldMapWithSectors(fieldId);
    return result;
  }

  @Query(() => FieldNdviMap, {
    description:
      'Figma: Drone Map View / NDVI Index — sectorlar NDVI rangi bilan',
  })
  @UseGuards(AuthGuard)
  @OwnedArgs({ fieldId: 'fieldMap' })
  public async fieldNdviMap(
    @Args('fieldId', { type: () => ID }) fieldId: string,
  ): Promise<FieldNdviMap> {
    const result = await this.fieldMapService.getFieldNdviMap(fieldId);
    return result;
  }

  @Query(() => FieldMapAnalytics, {
    description: 'Figma: Field Analytics — pastki grafik',
  })
  @UseGuards(AuthGuard)
  @OwnedArgs({ fieldId: 'fieldMap' })
  public async fieldAnalytics(
    @Args('fieldId', { type: () => ID }) fieldId: string,
    @Args('from', { nullable: true }) from?: string,
    @Args('to', { nullable: true }) to?: string,
  ): Promise<FieldMapAnalytics> {
    const result = await this.fieldMapService.getFieldAnalytics(
      fieldId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return result;
  }
}
