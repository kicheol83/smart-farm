import { Module } from '@nestjs/common';
import { PlanHealthService } from './plan-health.service';
import { PlanHealthResolver } from './plan-health.resolver';
import { PlantHealthSchema } from '../../schemas/farm/PlantHealth';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'plantHealth', schema: PlantHealthSchema },
    ]),
    AuthModule,
  ],
  
  providers: [PlanHealthService, PlanHealthResolver],
  exports: [PlanHealthService],
})
export class PlanHealthModule {}
