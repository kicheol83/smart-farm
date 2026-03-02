import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from 'apps/smart-farm/src/libs/types/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext | any): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);

    if (context.contextType === 'graphql') {
      const request = context.getArgByIndex(2).req;
      const bearerToken = request.headers.authorization;
      if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

      const token = bearerToken.split(' ')[1];
      const authMember = await this.authService.verifyToken(token);

      if (!authMember)
        throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);

      const hasPermission = roles.includes(authMember.memberType);
      if (!hasPermission)
        throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);

      request.body.authMember = authMember;
      return true;
    }
    // description => http, rpc, gprs and etc are ignored

    throw new UnauthorizedException('Unsupported context type');
  }
}
