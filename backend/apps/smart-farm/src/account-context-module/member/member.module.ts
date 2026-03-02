import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberResolver } from './member.resolver';

@Module({
  providers: [MemberService, MemberResolver]
})
export class MemberModule {}
