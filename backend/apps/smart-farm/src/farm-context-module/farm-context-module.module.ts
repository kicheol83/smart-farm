import { Module } from '@nestjs/common';
import { FarmsModule } from './farms/farms.module';
import { FieldsModule } from './fields/fields.module';
import { GreenhouseModule } from './greenhouse/greenhouse.module';
import { CropsModule } from './crops/crops.module';
import { PlanHealthModule } from './plan-health/plan-health.module';
import { WaterUsageModule } from './water-usage/water-usage.module';
import { SectionsModule } from './sections/sections.module';
import { PlantHealthMonitoringModule } from './plant-health-monitoring/plant-health-monitoring.module';

@Module({
  imports: [
    FarmsModule,
    FieldsModule,
    GreenhouseModule,
    CropsModule,
    PlanHealthModule,
    WaterUsageModule,
    SectionsModule,
    PlantHealthMonitoringModule,
  ],
})
export class FarmContextModuleModule {}
