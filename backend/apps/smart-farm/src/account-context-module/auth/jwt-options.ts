import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { AUTH_TIMER } from '../../libs/config';

export const jwtOptionsFactory = (config: ConfigService): JwtModuleOptions => ({
  secret: config.getOrThrow<string>('SECRET_TOKEN'),
  signOptions: { expiresIn: `${AUTH_TIMER}d` },
});
