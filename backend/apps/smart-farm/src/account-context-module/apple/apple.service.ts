import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export interface ApplePayload {
  appleId: string;
  memberEmail: string;
  memberFullName: string;
}

@Injectable()
export class AppleService {
  private readonly logger = new Logger(AppleService.name);
  private readonly jwksClient: jwksClient.JwksClient;
  private readonly clientId: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = config.getOrThrow<string>('APPLE_CLIENT_ID');

    this.jwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600_000, // 10 daqiqa cache
    });
  }

  async verifyToken(
    identityToken: string,
    fullName?: string,
  ): Promise<ApplePayload> {
    try {
      const decoded = jwt.decode(identityToken, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid Apple token format.');
      }

      const kid = decoded.header.kid;
      if (!kid) {
        throw new UnauthorizedException('Apple token missing key ID.');
      }
      const signingKey = await this.getSigningKey(kid);
      const payload = jwt.verify(identityToken, signingKey, {
        algorithms: ['RS256'],
        audience: this.clientId,
        issuer: 'https://appleid.apple.com',
      }) as jwt.JwtPayload;

      if (!payload.sub) {
        throw new UnauthorizedException('Apple token missing subject.');
      }
      const memberEmail =
        payload.email ?? `${payload.sub}@privaterelay.appleid.com`;
      return {
        appleId: payload.sub,
        memberEmail,
        memberFullName: fullName ?? memberEmail.split('@')[0],
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error(`Apple token verification failed: ${err}`);
      throw new UnauthorizedException('Invalid or expired Apple token.');
    }
  }

  // ─── Private
  private async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err || !key) {
          reject(new UnauthorizedException('Could not get Apple signing key.'));
          return;
        }
        resolve(key.getPublicKey());
      });
    });
  }
}
