import { Module } from '@nestjs/common';
import { CropsResolver } from './crops.resolver';
import { CropsService } from './crops.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CropsSchema } from '../../schemas/farm/Crops.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'crops', schema: CropsSchema }]),
    AuthModule,
  ],
  providers: [CropsResolver, CropsService],
  exports: [CropsService],
})
export class CropsModule {}
