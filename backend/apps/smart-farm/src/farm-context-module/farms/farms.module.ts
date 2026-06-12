import { Module } from '@nestjs/common';
import { FarmsResolver } from './farms.resolver';
import { FarmsService } from './farms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FarmsSchema } from '../../schemas/farm/Farms.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'farms', schema: FarmsSchema }]),
    AuthModule,
  ],
  providers: [FarmsResolver, FarmsService],
  exports: [FarmsService],
})
export class FarmsModule {}
