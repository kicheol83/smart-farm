import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { AnomalyLog } from '../../libs/dto/mid-iot/anomaly-detection';

@Resolver()
export class AnomalyDetectionResolver {
  constructor(private readonly anomalyService: AnomalyDetectionService) {}

  @Query(() => [AnomalyLog])
  public async anomalyLogs(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<AnomalyLog[]> {
    return this.anomalyService.findByGreenhouse(greenHouseId, limit) as any;
  }

  @Mutation(() => Boolean)
  public async resolveAnomaly(
    @Args('anomalyId', { type: () => ID }) anomalyId: string,
  ): Promise<boolean> {
    await this.anomalyService.resolve(anomalyId);
    return true;
  }
}
