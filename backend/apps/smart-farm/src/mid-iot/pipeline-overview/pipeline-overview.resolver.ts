import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { PipelineOverview } from '../../libs/dto/mid-iot/pipeline-overview';
import { PipelineOverviewService } from './pipeline-overview.service';

@Resolver()
@UseGuards(AuthGuard)
export class PipelineOverviewResolver {
  constructor(private readonly overviewService: PipelineOverviewService) {}

  @Query(() => PipelineOverview)
  public async pipelineOverview(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<PipelineOverview> {
    return this.overviewService.getOverview(greenHouseId);
  }
}
