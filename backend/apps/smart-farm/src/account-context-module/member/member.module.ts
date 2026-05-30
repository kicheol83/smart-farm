import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberResolver } from './member.resolver';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { MemberSchema } from '../../schemas/account/Member.model';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { MailModule } from '../mail/mail.module';
import { EmailVerificationsModule } from '../email-verifications/email-verifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
    AuthModule,
    EmailVerificationsModule,
    MailModule,
  ],
  providers: [MemberService, MemberResolver, ],
})
export class MemberModule {}
