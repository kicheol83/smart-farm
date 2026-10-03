import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from '../../../libs/types/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext | any): Promise<boolean> {
    console.info('--- @guard() Authentication [AuthGuard] ---');

    if (context.contextType === 'graphql') {
      const request = context.getArgByIndex(2).req;

      const bearerToken = request.headers.authorization;
      if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

      const token = bearerToken.split(' ')[1];
      let authMember: any;
      try {
        authMember = await this.authService.verifyToken(token);
      } catch {
        throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
      }
      if (!authMember)
        throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

      console.log('memberFullName[auth] =>', authMember.memberFullName);
      request.body.authMember = authMember;

      return true;
    }

    // description => http, rpc, gprs and etc are ignored
  }
}
