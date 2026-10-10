import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Server } from 'socket.io';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceAuthService } from '../device-auth/device-auth.service';
import {
  MqttSensorDataPayload,
  MqttSensorReading,
  MqttStatusPayload,
  WsAlertEvent,
  WsDeviceStatusEvent,
  WsSensorUpdateEvent,
} from '../../libs/dto/iot-pipeline.dto';
import { TimeseriesService } from '../../mid-iot/timeseries/timeseries.service';
import {
  BufferedMessage,
  MessageBuffersService,
} from '../../mid-iot/message-buffers/message-buffers.service';
import { CalibrationService } from '../../mid-iot/calibration/calibration.service';
import { AnomalyDetectionService } from '../../mid-iot/anomaly-detection/anomaly-detection.service';
import {
  IotRateLimiterService,
  RateLimitType,
} from '../../prof-iot/iot-rate-limiter/iot-rate-limiter.service';
import { IotErrorHandlerService } from '../../prof-iot/iot-error-handler/iot-error-handler.service';
import { ActuatorService } from '../../actuator/actuator.service';
import {
  deviceIdFromTopic,
  isSensorEnvelope,
  isUsableReading,
  resolveRecordedAt,
} from './sensor-payload';

interface ISensorData extends Document {
  sensorDataName: string;
  sensorDataValue: number;
  recordedAt: Date;
  sensorId: Types.ObjectId;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  sensorsUnit: string;
  deviceId: Types.ObjectId;
}

interface IDevice extends Document {
  _id: Types.ObjectId;
  deviceName: string;
  deviceStatus: string;
  greenHouseId: Types.ObjectId;
  sectionId?: Types.ObjectId;
}

interface IAlert extends Document {
  _id: Types.ObjectId;
  alertsType: string;
  alertsThreshold: number;
  alertsActualValues: string;
  alertsSeverity: string;
  sensorsId: Types.ObjectId;
}

interface IAlertNotification extends Document {
  message: string;
  isRead: boolean;
  memberId: Types.ObjectId;
  alertsId: Types.ObjectId;
}

interface IFarm extends Document {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
}

interface IGreenhouse extends Document {
  _id: Types.ObjectId;
  farmsId: Types.ObjectId;
  greenHouseName: string;
}

@Injectable()
export class IotPipelineService implements OnModuleInit {
  private readonly logger = new Logger(IotPipelineService.name);
  private wsServer?: Server;

  constructor(
    private readonly mqttService: MqttService,
    private readonly deviceAuthService: DeviceAuthService,
    private readonly timeSeriesService: TimeseriesService,
    private readonly messageBuffer: MessageBuffersService,
    private readonly anomalyDetection: AnomalyDetectionService,
    private readonly calibrationService: CalibrationService,
    private readonly rateLimiter: IotRateLimiterService,
    private readonly errorHandler: IotErrorHandlerService,
    private readonly actuatorService: ActuatorService,

    @InjectModel('sensor_data')
    private readonly sensorDataModel: Model<ISensorData>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('alerts')
    private readonly alertModel: Model<IAlert>,

    @InjectModel('alertNotifications')
    private readonly notifModel: Model<IAlertNotification>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,

    @InjectModel('farms')
    private readonly farmModel: Model<IFarm>,
  ) {}

  onModuleInit(): void {
    this.messageBuffer.setProcessor((message) => this.processBuffered(message));

    this.mqttService.registerHandler(
      MqttService.TOPICS.ALL_SENSORS,
      this.handleSensorData.bind(this),
    );

    this.mqttService.registerHandler(
      MqttService.TOPICS.ALL_STATUS,
      this.handleDeviceStatus.bind(this),
    );
  }

  setWsServer(server: Server): void {
    this.wsServer = server;
  }

  private async handleSensorData(
    topic: string,
    payloadBuffer: Buffer,
  ): Promise<void> {
    let payload: MqttSensorDataPayload;
    try {
      payload = JSON.parse(payloadBuffer.toString());
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      await this.errorHandler.handleMqttParseError(
        topic,
        payloadBuffer.toString(),
        error,
      );
      return;
    }

    if (
      !isSensorEnvelope(payload) ||
      deviceIdFromTopic(topic) !== payload.deviceId
    ) {
      await this.errorHandler.handleMqttParseError(
        topic,
        '[rejected sensor payload]',
        new Error('Sensor payload shape or topic device does not match.'),
      );
      return;
    }

    let messageId: string | null = null;
    try {
      messageId = await this.messageBuffer.enqueue(
        topic,
        payloadBuffer.toString(),
      );
    } catch (err) {
      this.logger.error(
        `Buffer unavailable, processing without retry | deviceId=${payload.deviceId} | ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const allowed = await this.rateLimiter.isAllowed(
      payload.deviceId,
      RateLimitType.SENSOR_DATA,
    );
    if (!allowed) {
      this.logger.warn(`Rate limited | deviceId=${payload.deviceId}`);
      if (messageId) await this.messageBuffer.acknowledge(messageId);
      return;
    }

    await this.processSensorMessage(payload, messageId, new Date(), []);
  }

  private async processBuffered(message: BufferedMessage): Promise<void> {
    await this.processSensorMessage(
      JSON.parse(message.payload),
      message.id,
      new Date(message.receivedAt),
      message.done ?? [],
    );
  }

  private async processSensorMessage(
    payload: MqttSensorDataPayload,
    messageId: string | null,
    receivedAt: Date,
    done: string[],
  ): Promise<void> {
    try {
      const device = await this.authorizeDevice(payload.deviceId, payload.apiKey);
      if (!device) {
        if (messageId) await this.messageBuffer.acknowledge(messageId);
        return;
      }

      const recordedAt = resolveRecordedAt(payload.timestamp, receivedAt);
      const greenhouse = await this.greenhouseModel
        .findById(device.greenHouseId)
        .exec();

      const owned = await this.ownedReadings(device, payload.readings);
      if (owned.length < payload.readings.length) {
        this.logger.warn(
          `Rejected ${payload.readings.length - owned.length} of ${payload.readings.length} readings | deviceId=${payload.deviceId}`,
        );
      }
      const readings = owned.filter((r) => !done.includes(r.sensorId));

      const results = await Promise.allSettled(
        readings.map((reading) =>
          this.processReading(reading, payload.deviceId, device, greenhouse, recordedAt),
        ),
      );
      const succeeded = readings
        .filter((_, i) => results[i].status === 'fulfilled')
        .map((r) => r.sensorId);
      const failure = results.find(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      );

      if (!failure) {
        if (messageId) await this.messageBuffer.acknowledge(messageId);
        return;
      }

      const error =
        failure.reason instanceof Error ? failure.reason : new Error(String(failure.reason));
      if (messageId) await this.messageBuffer.markFailed(messageId, error.message, succeeded);
      await this.reportSaveError(payload.deviceId, error);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (messageId) await this.messageBuffer.markFailed(messageId, error.message);
      await this.reportSaveError(payload.deviceId, error);
    }
  }

  private async reportSaveError(deviceId: string, error: Error): Promise<void> {
    try {
      await this.errorHandler.handleSensorSaveError(deviceId, 'batch', error);
    } catch (logError) {
      this.logger.warn(
        `Could not record sensor save error | deviceId=${deviceId} | ${logError instanceof Error ? logError.message : String(logError)}`,
      );
    }
  }

  private async processReading(
    reading: MqttSensorReading,
    deviceId: string,
    device: IDevice,
    greenhouse: IGreenhouse | null,
    recordedAt: Date,
  ): Promise<void> {
    const calibratedValue = await this.calibrationService.apply(
      reading.sensorId,
      reading.value,
    );

    await Promise.all([
      this.sensorDataModel.create({
        sensorDataName: reading.type,
        sensorDataValue: calibratedValue,
        recordedAt,
        sensorId: new Types.ObjectId(reading.sensorId),
      }),
      this.timeSeriesService.insert(
        reading.sensorId,
        reading.type,
        deviceId,
        reading.unit,
        calibratedValue,
        recordedAt,
      ),
    ]);

    await this.checkAndCreateAlert(
      reading.sensorId,
      calibratedValue,
      reading.type,
      device,
      greenhouse,
    );

    const anomaly = await this.anomalyDetection.check(
      reading.sensorId,
      reading.type,
      deviceId,
      String(device.greenHouseId),
      calibratedValue,
    );

    this.actuatorService
      .evaluateRules(
        String(device.greenHouseId),
        reading.type,
        calibratedValue,
        device.sectionId ? String(device.sectionId) : undefined,
      )
      .catch((err: Error) =>
        this.logger.error(
          `Automation evaluation failed | sensorId=${reading.sensorId} | ${err.message}`,
        ),
      );

    if (anomaly.isAnomaly) {
      this.broadcastAlert({
        type: 'ANOMALY',
        greenHouseId: String(device.greenHouseId),
        alertId: reading.sensorId,
        alertType: reading.type,
        severity: anomaly.severity!,
        message: 'Z-Score anomaly: ' + anomaly.zScore,
        currentValue: calibratedValue,
        threshold: anomaly.mean,
        timestamp: recordedAt.toISOString(),
      });
    }

    this.broadcastSensorUpdate({
      type: 'SENSOR_UPDATE',
      greenHouseId: String(device.greenHouseId),
      deviceId,
      sensorId: reading.sensorId,
      sensorType: reading.type,
      value: calibratedValue,
      unit: reading.unit,
      timestamp: recordedAt.toISOString(),
    });
  }

  private async handleDeviceStatus(
    topic: string,
    payloadBuffer: Buffer,
  ): Promise<void> {
    let payload: MqttStatusPayload;

    try {
      payload = JSON.parse(payloadBuffer.toString());
    } catch {
      this.logger.warn(`Invalid status JSON | topic=${topic}`);
      return;
    }

    const authorized = await this.authorizeDevice(
      payload.deviceId,
      payload.apiKey,
    );
    if (!authorized) {
      return;
    }

    const device = await this.deviceModel
      .findByIdAndUpdate(
        payload.deviceId,
        { deviceStatus: payload.status },
        { new: true },
      )
      .exec();

    if (!device) return;

    this.logger.log(`Device status | ${device.deviceName} → ${payload.status}`);

    this.broadcastDeviceStatus({
      type: 'DEVICE_STATUS',
      greenHouseId: String(device.greenHouseId),
      deviceId: payload.deviceId,
      deviceName: device.deviceName,
      status: payload.status,
      timestamp: new Date().toISOString(),
    });
  }

  private async ownedReadings(
    device: IDevice,
    readings: unknown[],
  ): Promise<MqttSensorReading[]> {
    const usable = readings.filter(isUsableReading);
    if (usable.length === 0) return [];

    const sensors = await this.sensorModel
      .find({
        _id: { $in: usable.map((r) => new Types.ObjectId(r.sensorId)) },
        deviceId: device._id,
      })
      .select('_id sensorType sensorsUnit')
      .exec();
    const byId = new Map(sensors.map((s) => [String(s._id), s]));

    return usable.flatMap((reading) => {
      const sensor = byId.get(reading.sensorId);
      if (!sensor) return [];
      return [
        {
          sensorId: reading.sensorId,
          type: sensor.sensorType,
          unit: sensor.sensorsUnit ?? reading.unit,
          value: reading.value,
        },
      ];
    });
  }

  private async authorizeDevice(
    deviceId: string,
    apiKey: string,
  ): Promise<IDevice | null> {
    let keyDeviceId: Types.ObjectId;
    try {
      keyDeviceId = await this.deviceAuthService.validateApiKey(apiKey);
    } catch (err) {
      if (!(err instanceof UnauthorizedException)) throw err;
      await this.errorHandler.handleAuthError(
        String(deviceId),
        err instanceof Error ? err.message : String(err),
      );
      return null;
    }

    if (String(keyDeviceId) !== String(deviceId)) {
      await this.errorHandler.handleAuthError(
        String(deviceId),
        'API key does not belong to this device.',
      );
      return null;
    }

    const device = Types.ObjectId.isValid(deviceId)
      ? await this.deviceModel.findById(deviceId).exec()
      : null;
    if (!device) {
      await this.errorHandler.handleAuthError(
        String(deviceId),
        'Device not found.',
      );
      return null;
    }

    return device;
  }

  private async checkAndCreateAlert(
    sensorId: string,
    value: number,
    sensorType: string,
    device: IDevice,
    greenhouse: IGreenhouse | null,
  ): Promise<void> {
    const alerts = await this.alertModel
      .find({ sensorsId: new Types.ObjectId(sensorId) })
      .exec();

    for (const alert of alerts) {
      const breached = this.isBreached(value, alert);
      if (!breached) continue;

      const farm = greenhouse
        ? await this.farmModel.findById(greenhouse.farmsId).exec()
        : null;

      if (farm) {
        const message =
          `${sensorType} alert: value ${value} ` +
          `${alert.alertsActualValues === 'HIGH' ? 'above' : 'below'} ` +
          `threshold ${alert.alertsThreshold}`;

        await this.notifModel.create({
          message,
          isRead: false,
          memberId: farm.memberId,
          alertsId: alert._id,
        });
      }

      this.broadcastAlert({
        type: 'ALERT',
        greenHouseId: String(device.greenHouseId),
        alertId: String(alert._id),
        alertType: alert.alertsType,
        severity: alert.alertsSeverity,
        message: `${sensorType} ${alert.alertsActualValues === 'HIGH' ? 'exceeded' : 'below'} threshold`,
        currentValue: value,
        threshold: alert.alertsThreshold,
        timestamp: new Date().toISOString(),
      });

      this.logger.warn(
        `ALERT | sensor=${sensorId} | value=${value} | threshold=${alert.alertsThreshold} | severity=${alert.alertsSeverity}`,
      );
    }
  }

  private isBreached(value: number, alert: IAlert): boolean {
    if (alert.alertsActualValues === 'HIGH')
      return value > alert.alertsThreshold;
    if (alert.alertsActualValues === 'LOW')
      return value < alert.alertsThreshold;
    return false;
  }

  private broadcastSensorUpdate(event: WsSensorUpdateEvent): void {
    if (!this.wsServer) return;
    this.wsServer
      .to(`greenhouse:${event.greenHouseId}`)
      .emit('sensor-update', event);
  }

  private broadcastAlert(event: WsAlertEvent): void {
    if (!this.wsServer) return;
    this.wsServer.to(`greenhouse:${event.greenHouseId}`).emit('alert', event);
  }

  private broadcastDeviceStatus(event: WsDeviceStatusEvent): void {
    if (!this.wsServer) return;
    this.wsServer
      .to(`greenhouse:${event.greenHouseId}`)
      .emit('device-status', event);
  }
}
