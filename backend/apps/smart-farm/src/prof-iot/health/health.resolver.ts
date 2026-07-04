import { Query, Resolver } from '@nestjs/graphql';
import { HealthService, SystemHealth } from './health.service';
@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => SystemHealth)
  public async systemHealth(): Promise<SystemHealth> {
    return this.healthService.checkAll();
  }
}
