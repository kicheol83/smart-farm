import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class WithoutGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext | any): Promise<boolean> {
    console.info('--- @guard() Authentication [WithoutGuard] ---');

    if (context.contextType === 'graphql') {
      const request = context.getArgByIndex(2).req,
        bearerToken = request.headers.authorization;

      if (bearerToken) {
        try {
          const token = bearerToken.split(' ')[1],
            authMember = await this.authService.verifyToken(token);
          request.body.authMember = authMember;
        } catch (err) {
          console.log(err);
          request.body.authMember = null;
        }
      } else request.body.authMember = null;

      console.log(
        'memberFullName[without] =>',
        request.body.authMember?.memberFullName ?? 'none',
      );
      return true;
    }

    // description => http, rpc, gprs and etc are ignored
    throw new UnauthorizedException('Unsupported context type');
  }
}
