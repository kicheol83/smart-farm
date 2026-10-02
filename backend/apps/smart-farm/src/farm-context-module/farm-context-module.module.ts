import { Module } from '@nestjs/common';
import { FarmsModule } from './farms/farms.module';
import { FieldsModule } from './fields/fields.module';
import { GreenhouseModule } from './greenhouse/greenhouse.module';
import { CropsModule } from './crops/crops.module';
import { PlanHealthModule } from './plan-health/plan-health.module';
import { WaterUsageModule } from './water-usage/water-usage.module';
import { SectionsModule } from './sections/sections.module';
import { PlantHealthMonitoringModule } from './plant-health-monitoring/plant-health-monitoring.module';
import { FieldMapModule } from './field-map/field-map.module';
import { NdviModule } from './ndvi/ndvi.module';
import { WeatherModule } from './weather/weather.module';

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
    FieldMapModule,
    NdviModule,
    WeatherModule,
  ],
})
export class FarmContextModuleModule {}
