import { Module } from '@nestjs/common';
import { NdviService } from './ndvi.service';
import { NdviResolver } from './ndvi.resolver';

@Module({
  providers: [NdviService, NdviResolver]
})
export class NdviModule {}
