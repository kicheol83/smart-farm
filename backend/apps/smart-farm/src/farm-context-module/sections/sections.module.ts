import { Module } from '@nestjs/common';
import { SectionsResolver } from './sections.resolver';
import { SectionsService } from './sections.service';
import { SectionsSchema } from '../../schemas/farm/Sections.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'sections', schema: SectionsSchema }]),
  ],
  providers: [SectionsResolver, SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
