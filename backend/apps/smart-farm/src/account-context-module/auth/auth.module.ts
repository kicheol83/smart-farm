import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTH_TIMER } from '../../libs/config';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import MemberSchema from '../../schemas/account/Member.model';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
    HttpModule,
    JwtModule.register({
      secret: `${process.env.SECRET_TOKEN}`,
      signOptions: { expiresIn: `${AUTH_TIMER}d` },
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
