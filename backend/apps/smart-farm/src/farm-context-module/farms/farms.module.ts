import { Module } from '@nestjs/common';
import { FarmsResolver } from './farms.resolver';
import { FarmsService } from './farms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import { MemberModule } from '../../account-context-module/member/member.module';
import MemberSchema from '../../schemas/account/Member.model';
import FarmsSchema from '../../schemas/farm/Farms.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'farms', schema: FarmsSchema },
      { name: 'members', schema: MemberSchema },
    ]),
    AuthModule,
    MemberModule,
  ],
  providers: [FarmsResolver, FarmsService],
  exports: [FarmsService],
})
export class FarmsModule {}
