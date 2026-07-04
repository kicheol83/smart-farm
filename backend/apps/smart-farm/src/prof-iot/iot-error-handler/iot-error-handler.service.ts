import {
  Injectable,
  Logger,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document, Types } from 'mongoose';

export const SystemErrorLogSchema = new Schema(
  {
    errorType: { type: String, required: true },
    message: { type: String, required: true },
    stack: { type: String },
    context: { type: String },
    deviceId: { type: String, default: null },
    topic: { type: String, default: null },
    payload: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'systemErrorLogs' },
);

SystemErrorLogSchema.index({ errorType: 1 });
SystemErrorLogSchema.index({ createdAt: -1 });
SystemErrorLogSchema.index({ deviceId: 1 });

interface ISystemErrorLog extends Document {
  errorType: string;
  message: string;
  stack?: string;
  context?: string;
  deviceId?: string;
  topic?: string;
  payload?: string;
  resolvedAt?: Date;
}

@Injectable()
export class IotErrorHandlerService {
  private readonly logger = new Logger(IotErrorHandlerService.name);

  constructor(
    @InjectModel('systemErrorLogs')
    private readonly errorLogModel: Model<ISystemErrorLog>,
  ) {}

  public async handleMqttParseError(
    topic: string,
    payload: string,
    error: Error,
  ): Promise<void> {
    this.logger.error(
      `MQTT parse error | topic=${topic} | error=${error.message}`,
    );

    await this.errorLogModel.create({
      errorType: 'MQTT_PARSE_ERROR',
      message: error.message,
      stack: error.stack,
      context: 'MqttService',
      topic,
      payload: payload.substring(0, 500),
    });
  }

  public async handleAuthError(
    deviceId: string,
    reason: string,
  ): Promise<void> {
    this.logger.warn(
      `Device auth failed | deviceId=${deviceId} | reason=${reason}`,
    );

    await this.errorLogModel.create({
      errorType: 'DEVICE_AUTH_ERROR',
      message: reason,
      context: 'DeviceAuthService',
      deviceId,
    });
  }

  public async handleSensorSaveError(
    deviceId: string,
    sensorId: string,
    error: Error,
  ): Promise<void> {
    this.logger.error(
      `Sensor save error | device=${deviceId} | sensor=${sensorId} | ${error.message}`,
    );

    await this.errorLogModel.create({
      errorType: 'SENSOR_SAVE_ERROR',
      message: error.message,
      stack: error.stack,
      context: 'IotPipelineService',
      deviceId,
    });
  }

  public async handleWsError(
    greenHouseId: string,
    event: string,
    error: Error,
  ): Promise<void> {
    this.logger.error(
      `WebSocket error | gh=${greenHouseId} | event=${event} | ${error.message}`,
    );

    await this.errorLogModel.create({
      errorType: 'WEBSOCKET_ERROR',
      message: error.message,
      context: `MonitoringGateway:${event}`,
    });
  }

  public async getRecentErrors(limit = 50): Promise<ISystemErrorLog[]> {
    return this.errorLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markResolved(id: string): Promise<void> {
    await this.errorLogModel.findByIdAndUpdate(id, { resolvedAt: new Date() });
  }
}

@Catch(HttpException)
export class GqlHttpExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlHttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    GqlArgumentsHost.create(host);

    const status = exception.getStatus();
    const response = exception.getResponse() as any;

    const message =
      typeof response === 'string'
        ? response
        : (response.message ?? exception.message);

    this.logger.warn(`GraphQL [${status}]: ${JSON.stringify(message)}`);

    return new GraphQLError(
      Array.isArray(message) ? message.join(', ') : message,
      {
        extensions: {
          code: this.toCode(status),
          statusCode: status,
        },
      },
    );
  }

  private toCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'TOO_MANY_REQUESTS',
    };
    return map[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}

export const setupProcessHandlers = () => {
  const logger = new Logger('Process');

  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`, err.stack);
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error(`Unhandled Rejection: ${reason?.message ?? reason}`);
  });
};
