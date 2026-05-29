import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialResolver } from './social.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/account/Member.model';
import { AuthModule } from '../auth/auth.module';
import { GoogleAuthService } from '../google-auth/google-auth.service';
import { AppleService } from '../apple/apple.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
    AuthModule,
  ],
  providers: [GoogleAuthService, AppleService, SocialService, SocialResolver],
})
export class SocialModule {}
