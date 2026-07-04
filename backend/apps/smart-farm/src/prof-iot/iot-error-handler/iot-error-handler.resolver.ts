import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  ObjectType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { IotErrorHandlerService } from './iot-error-handler.service';
import { RolesGuard } from '../../account-context-module/auth/guards/roles.guard';
import { MemberRole } from '../../libs/enums/member.enum';
import { Roles } from '../../account-context-module/auth/decorators/roles.decorator';

export enum ErrorType {
  MQTT_PARSE_ERROR = 'MQTT_PARSE_ERROR',
  DEVICE_AUTH_ERROR = 'DEVICE_AUTH_ERROR',
  SENSOR_SAVE_ERROR = 'SENSOR_SAVE_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
}

registerEnumType(ErrorType, {
  name: 'ErrorType',
  valuesMap: {
    MQTT_PARSE_ERROR: { description: 'MQTT payload parse xatosi' },
    DEVICE_AUTH_ERROR: { description: 'Qurilma autentifikatsiya xatosi' },
    SENSOR_SAVE_ERROR: { description: 'Sensor data saqlash xatosi' },
    WEBSOCKET_ERROR: { description: 'WebSocket broadcast xatosi' },
  },
});

@ObjectType()
export class SystemErrorLog {
  @Field(() => ID)
  _id: string;

  @Field()
  errorType: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  context?: string;

  @Field({ nullable: true })
  deviceId?: string;

  @Field({ nullable: true })
  topic?: string;

  @Field({ nullable: true })
  payload?: string;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field()
  createdAt: Date;
}

@Resolver()
export class IotErrorHandlerResolver {
  constructor(private readonly errorHandler: IotErrorHandlerService) {}

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => [SystemErrorLog])
  public async systemErrorLogs(
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<SystemErrorLog[]> {
    const result = await this.errorHandler.getRecentErrors(limit);
    return result as any;
  }

  @Roles(MemberRole.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  public async markErrorResolved(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.errorHandler.markResolved(id);
    return true;
  }
}
