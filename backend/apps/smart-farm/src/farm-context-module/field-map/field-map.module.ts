import { Module } from '@nestjs/common';
import { FieldMapResolver } from './field-map.resolver';
import { FieldMapService } from './field-map.service';

@Module({
  providers: [FieldMapResolver, FieldMapService]
})
export class FieldMapModule {}
