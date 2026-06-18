import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FieldsSchema } from '../../schemas/farm/Fields.model';
import { FieldsResolver } from './fields.resolver';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { CropsModule } from '../crops/crops.module';
import { SectionsModule } from '../sections/sections.module';
import { CropsSchema } from '../../schemas/farm/Crops.model';
import { SectionsSchema } from '../../schemas/farm/Sections.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'fields',
        schema: FieldsSchema,
      },
      {
        name: 'sections',
        schema: SectionsSchema,
      },
      {
        name: 'crops',
        schema: CropsSchema,
      },
    ]),
    AuthModule,
    CropsModule,
    SectionsModule,
  ],
  providers: [FieldsService, FieldsResolver],
  exports: [FieldsService],
})
export class FieldsModule {}
