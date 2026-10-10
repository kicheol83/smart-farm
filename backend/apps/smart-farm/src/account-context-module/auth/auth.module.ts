import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { jwtOptionsFactory } from './jwt-options';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import MemberSchema from '../../schemas/account/Member.model';
import { HttpModule } from '@nestjs/axios';
import { AuthResolver } from './auth.resolver';
import { MailModule } from '../mail/mail.module';
import { EmailVerificationsModule } from '../email-verifications/email-verifications.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';
import { GreenhouseModule } from '../../farm-context-module/greenhouse/greenhouse.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
    HttpModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtOptionsFactory,
    }),
    MailModule,
    EmailVerificationsModule,
    PasswordResetModule,
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
