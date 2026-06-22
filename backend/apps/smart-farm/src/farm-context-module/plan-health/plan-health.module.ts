import { Module } from '@nestjs/common';
import { PlanHealthService } from './plan-health.service';
import { PlanHealthResolver } from './plan-health.resolver';
import { PlantHealthSchema } from '../../schemas/farm/PlantHealth';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { FieldsSchema } from '../../schemas/farm/Fields.model';
import { FieldsModule } from '../fields/fields.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'plantHealth', schema: PlantHealthSchema },
      { name: 'fields', schema: FieldsSchema },
    ]),
    AuthModule,
    FieldsModule,
  ],

  providers: [PlanHealthService, PlanHealthResolver],
  exports: [PlanHealthService],
})
export class PlanHealthModule {}
