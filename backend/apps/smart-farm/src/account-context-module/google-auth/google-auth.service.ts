import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

export interface GooglePayload {
  googleId: string;
  memberEmail: string;
  memberFullName: string;
  memberAvatar: string;
}

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async verifyToken(idToken: string): Promise<GooglePayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload.');
      }
      if (!payload.email_verified) {
        throw new UnauthorizedException('Google email is not verified.');
      }
      return {
        googleId: payload.sub, // Google unique ID
        memberEmail: payload.email!,
        memberFullName: payload.name ?? payload.email!, // ism bo'lmasa email
        memberAvatar: payload.picture ?? '',
      };
    } catch (err) {
      this.logger.error(`Google token verification failed: ${err}`);
      throw new UnauthorizedException('Invalid or expired Google token.');
    }
  }
}
