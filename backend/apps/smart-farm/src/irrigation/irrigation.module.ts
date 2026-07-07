import { Module } from '@nestjs/common';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { AutoIrrigationModule } from './auto-irrigation/auto-irrigation.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [AiAnalysisModule, AutoIrrigationModule, SubscriptionModule],
  exports: [AiAnalysisModule, AutoIrrigationModule, SubscriptionModule],
})
export class IrrigationModule {}
