import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface RequestMeta {
  device: string;
  ipAddress: string;
}

export const RequestMeta = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestMeta => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const userAgent: string = req?.headers?.['user-agent'] ?? '';
    const ipAddress: string =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
      req?.ip ??
      req?.connection?.remoteAddress ??
      'unknown';

    return {
      device: simplifyUserAgent(userAgent),
      ipAddress,
    };
  },
);

function simplifyUserAgent(ua: string): string {
  if (!ua) return 'Unknown Device';

  const iosMatch = ua.match(/iPhone OS (\d+)_(\d+)(?:_(\d+))?/);
  if (iosMatch) {
    const [, major, minor, patch] = iosMatch;
    return `iOS-${major}.${minor}${patch ? `.${patch}` : ''}`;
  }

  const androidMatch = ua.match(/Android (\d+(?:\.\d+)?)/);
  if (androidMatch) {
    return `Android-${androidMatch[1]}`;
  }

  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS X/.test(ua)
      ? 'macOS'
      : /Linux/.test(ua)
        ? 'Linux'
        : '';
  if (chromeMatch) {
    return `Chrome-${chromeMatch[1]}${os ? ` / ${os}` : ''}`;
  }

  const safariMatch = ua.match(/Version\/(\d+).*Safari/);
  if (safariMatch) {
    return `Safari-${safariMatch[1]}${os ? ` / ${os}` : ''}`;
  }

  return 'Unknown Device';
}
