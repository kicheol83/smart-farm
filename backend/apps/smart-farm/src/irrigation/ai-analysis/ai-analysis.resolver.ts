import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import {
  AiAnalysisResult,
  AnalyzeGreenhouseInput,
  IrrigationLog,
} from '../../libs/dto/ai.analysis.dto';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

@Resolver()
export class AiAnalysisResolver {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Query(() => AiAnalysisResult)
  @UseGuards(AuthGuard)
  public async analyzeGreenhouse(
    @Args('input') input: AnalyzeGreenhouseInput,
  ): Promise<AiAnalysisResult> {
    const result = await this.aiAnalysisService.analyze(input.greenHouseId);
    return result;
  }

  @Query(() => [IrrigationLog])
  @UseGuards(AuthGuard)
  public async irrigationLogs(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<IrrigationLog[]> {
    const result = await this.aiAnalysisService.getLogs(greenHouseId, limit);
    return result as any;
  }
}
