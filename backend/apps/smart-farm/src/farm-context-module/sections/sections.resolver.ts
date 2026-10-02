import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreateSectionInput,
  GreenhouseSectionOverview,
  Section,
  SectionHealthSummary,
  UpdateSectionHealthInput,
  UpdateSectionInput,
} from '../../libs/dto/farm-context-dto/sections/sections';
import { SectionsService } from './sections.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { OwnedBy } from '../../ownership/owned-by.decorator';

@Resolver(() => Section)
export class SectionsResolver {
  constructor(private readonly sectionService: SectionsService) {}

  @Mutation(() => Section, { description: 'Yangi section yaratish' })
  @UseGuards(AuthGuard)
  public async createSection(
    @Args('input') input: CreateSectionInput,
  ): Promise<Section> {
    const result = this.sectionService.create(input) as any;
    return result;
  }

  @Query(() => [Section])
  @UseGuards(AuthGuard)
  public async sectionsByGreenhouse(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<Section[]> {
    const result = this.sectionService.findByGreenhouse(greenHouseId) as any;
    return result;
  }

  @Query(() => Section)
  @UseGuards(AuthGuard)
  @OwnedBy('section')
  public async section(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Section> {
    const result = this.sectionService.findOne(id) as any;
    return result;
  }

  @Mutation(() => Section)
  @UseGuards(AuthGuard)
  @OwnedBy('section')
  public async updateSection(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSectionInput,
  ): Promise<Section> {
    const result = this.sectionService.update(id, input) as any;
    return result;
  }

  @Mutation(() => Boolean, { description: "Section o'chirish" })
  @UseGuards(AuthGuard)
  @OwnedBy('section')
  public async deleteSection(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = this.sectionService.remove(id);
    return result;
  }

  @Mutation(() => Section)
  @UseGuards(AuthGuard)
  public async updateSectionHealth(
    @Args('input') input: UpdateSectionHealthInput,
  ): Promise<Section> {
    const result = this.sectionService.updateHealth(input) as any;
    return result;
  }

  @Query(() => GreenhouseSectionOverview)
  @UseGuards(AuthGuard)
  public async greenhouseSectionOverview(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<GreenhouseSectionOverview> {
    const result = this.sectionService.getGreenhouseOverview(greenHouseId);
    return result;
  }

  @Query(() => SectionHealthSummary)
  @UseGuards(AuthGuard)
  public async sectionMonitoringDetail(
    @Args('sectionId', { type: () => ID }) sectionId: string,
  ): Promise<SectionHealthSummary> {
    const result = this.sectionService.getSectionDetail(sectionId);
    return result;
  }
}
