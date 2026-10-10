import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { from, Observable, switchMap } from 'rxjs';
import { MemberRole } from '../libs/enums/member.enum';
import { OWNED_ARGS_KEY, OWNED_BY_KEY, OwnedResource } from './owned-by.decorator';
import { OwnershipService } from './ownership.service';

const ARG_RESOURCES: Record<string, OwnedResource> = {
  farmId: 'farm',
  farmsId: 'farm',
  greenHouseId: 'greenhouse',
  greenHousesId: 'greenhouse',
  sectionId: 'section',
  deviceId: 'device',
  sensorId: 'sensor',
  sensorsId: 'sensor',
  cameraId: 'camera',
  anomalyId: 'anomaly',
  actuatorId: 'actuator',
  taskId: 'task',
  sectorId: 'sector',
  fieldsId: 'field',
};

type Check = { resource: OwnedResource; id: unknown };

@Injectable()
export class OwnershipInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly ownershipService: OwnershipService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'graphql') {
      return next.handle();
    }

    const gqlContext = GqlExecutionContext.create(context);
    const member = gqlContext.getContext()?.req?.body?.authMember;
    if (!member?._id || member.memberRole === MemberRole.ADMIN) {
      return next.handle();
    }

    const args = gqlContext.getArgs() ?? {};
    const checks: Check[] = [];
    const idResource = this.reflector.get<OwnedResource | undefined>(
      OWNED_BY_KEY,
      context.getHandler(),
    );
    if (idResource && args.id !== undefined) {
      checks.push({ resource: idResource, id: args.id });
    }
    const argResources =
      this.reflector.get<Record<string, OwnedResource> | undefined>(
        OWNED_ARGS_KEY,
        context.getHandler(),
      ) ?? {};
    for (const [path, resource] of Object.entries(argResources)) {
      const id = path
        .split('.')
        .reduce<unknown>(
          (value, key) =>
            value && typeof value === 'object'
              ? (value as Record<string, unknown>)[key]
              : undefined,
          args,
        );
      if (id !== undefined && id !== null) {
        checks.push({ resource, id });
      }
    }
    this.collect(args, checks, 0);

    if (checks.length === 0) {
      return next.handle();
    }

    const cache = new Map<string, string | null>();
    const verify = async () => {
      for (const check of checks) {
        const ids = Array.isArray(check.id) ? check.id : [check.id];
        for (const id of ids) {
          await this.ownershipService.assertOwner(
            String(member._id),
            check.resource,
            id,
            cache,
          );
        }
      }
    };

    return from(verify()).pipe(switchMap(() => next.handle()));
  }

  private collect(value: unknown, checks: Check[], depth: number): void {
    if (depth > 2 || value === null || typeof value !== 'object') {
      return;
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const resource = ARG_RESOURCES[key];
      if (resource && child !== undefined && child !== null) {
        checks.push({ resource, id: child });
      } else if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
        this.collect(child, checks, depth + 1);
      }
    }
  }
}
