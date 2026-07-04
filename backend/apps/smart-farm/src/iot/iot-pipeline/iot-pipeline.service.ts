import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Server } from 'socket.io';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceAuthService } from '../device-auth/device-auth.service';
import {
  MqttSensorDataPayload,
  MqttStatusPayload,
  WsAlertEvent,
  WsDeviceStatusEvent,
  WsSensorUpdateEvent,
} from '../../libs/dto/iot-pipeline.dto';

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
    } catch {
      this.logger.warn(`Invalid sensor JSON | topic=${topic}`);
      return;
    }

    try {
      await this.deviceAuthService.validateApiKey(payload.apiKey);
    } catch {
      this.logger.warn(`Invalid API key | deviceId=${payload.deviceId}`);
      return;
    }

    const device = await this.deviceModel.findById(payload.deviceId).exec();
    if (!device) {
      this.logger.warn(`Device not found | id=${payload.deviceId}`);
      return;
    }

    const greenhouse = await this.greenhouseModel
      .findById(device.greenHouseId)
      .exec();

    await Promise.all(
      payload.readings.map(async (reading) => {
        await this.sensorDataModel.create({
          sensorDataName: reading.type,
          sensorDataValue: reading.value,
          recordedAt: new Date(payload.timestamp),
          sensorId: new Types.ObjectId(reading.sensorId),
        });

        await this.checkAndCreateAlert(
          reading.sensorId,
          reading.value,
          reading.type,
          device,
          greenhouse,
        );

        this.broadcastSensorUpdate({
          type: 'SENSOR_UPDATE',
          greenHouseId: String(device.greenHouseId),
          deviceId: payload.deviceId,
          sensorId: reading.sensorId,
          sensorType: reading.type,
          value: reading.value,
          unit: reading.unit,
          timestamp: payload.timestamp,
        });
      }),
    );

    this.logger.debug(
      `Sensor data saved | device=${payload.deviceId} | readings=${payload.readings.length}`,
    );
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

    try {
      await this.deviceAuthService.validateApiKey(payload.apiKey);
    } catch {
      this.logger.warn(`Invalid API key | deviceId=${payload.deviceId}`);
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
      deviceId: payload.deviceId,
      deviceName: device.deviceName,
      status: payload.status,
      timestamp: new Date().toISOString(),
    });
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
    this.wsServer.emit('device-status', event);
  }
}
