import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { MqttService } from '../iot/mqtt/mqtt.service';
import { DeviceAuthService } from '../iot/device-auth/device-auth.service';
import { MqttHeartbeatPayload } from '../libs/dto/iot-pipeline.dto';

interface IDevice extends Document {
  _id: Types.ObjectId;
  deviceName: string;
  deviceStatus: string;
  greenHouseId: Types.ObjectId;
}

// Redis TTL — heartbeat kelib turmasin: qurilma offline
const HEARTBEAT_TTL_SECONDS = 90; // 90 soniya — qurilma 30-60s da ping yuboradi
const HEARTBEAT_KEY = (deviceId: string) => `hb:${deviceId}`;

@Injectable()
export class HeartBeatService implements OnModuleInit {
  private readonly logger = new Logger(HeartBeatService.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly deviceAuthService: DeviceAuthService,

    @InjectRedis()
    private readonly redis: Redis,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,
  ) {}

  onModuleInit(): void {
    // MQTT heartbeat handlerni ro'yxatdan o'tkazish
    this.mqttService.registerHandler(
      MqttService.TOPICS.ALL_HEARTBEATS,
      this.handleHeartbeat.bind(this),
    );
  }

  // ─── MQTT Handler: Heartbeat ──────────────────────────────────────────────

  /**
   * Qurilma ping yuborganda:
   * 1. API key tekshirish
   * 2. Redis da TTL yangilash (90 soniya)
   * 3. Device status ONLINE ga o'zgartirish (agar OFFLINE bo'lsa)
   *
   * Qurilma MQTT publish qilishi:
   * topic: sf/devices/{deviceId}/heartbeat
   * payload: { "apiKey": "sf_...", "deviceId": "...", "timestamp": "..." }
   */
  private async handleHeartbeat(
    topic: string,
    payloadBuffer: Buffer,
  ): Promise<void> {
    let payload: MqttHeartbeatPayload;
    const match = topic.match(/^sf\/devices\/([^/]+)\/heartbeat$/);

    if (!match) {
      this.logger.warn(`Invalid heartbeat topic: ${topic}`);
      return;
    }

    const deviceId = match[1];

    try {
      payload = JSON.parse(payloadBuffer.toString());
      payload = JSON.parse(payloadBuffer.toString());

      this.logger.debug(`Topic: ${topic}`);
    } catch {
      this.logger.warn(`Invalid heartbeat JSON | topic=${topic}`);
      return;
    }

    try {
      await this.deviceAuthService.validateApiKey(payload.apiKey);
    } catch {
      this.logger.warn(`Invalid API key | deviceId=${payload.deviceId}`);
      return;
    }

    // Redis da heartbeat TTL yangilash
    await this.redis.setex(
      HEARTBEAT_KEY(deviceId),
      HEARTBEAT_TTL_SECONDS,
      JSON.stringify({
        uptime: payload.uptime,
        freeMemory: payload.freeMemory,
        signalStrength: payload.signalStrength,
        lastSeen: payload.timestamp,
      }),
    );

    // Agar qurilma OFFLINE edi — ONLINE ga o'tkazish
    const device = await this.deviceModel.findById(deviceId).exec();
    if (device && device.deviceStatus !== 'ONLINE') {
      await this.deviceModel.findByIdAndUpdate(deviceId, {
        deviceStatus: 'ONLINE',
      });
      this.logger.log(`Device came online | ${device.deviceName}`);
    }
  }

  // ─── Cron: Offline Detection ──────────────────────────────────────────────

  /**
   * Har 60 soniyada barcha ONLINE qurilmalarni tekshiradi.
   * Agar Redis da heartbeat yo'q bo'lsa — qurilma OFFLINE deb belgilanadi.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async detectOfflineDevices(): Promise<void> {
    const onlineDevices = await this.deviceModel
      .find({ deviceStatus: 'ONLINE' })
      .exec();

    const offlineIds: string[] = [];

    for (const device of onlineDevices) {
      const key = HEARTBEAT_KEY(String(device._id));
      const alive = await this.redis.exists(key);

      if (!alive) {
        offlineIds.push(String(device._id));
      }
    }

    if (!offlineIds.length) return;

    // Batch update
    await this.deviceModel.updateMany(
      { _id: { $in: offlineIds.map((id) => new Types.ObjectId(id)) } },
      { deviceStatus: 'OFFLINE' },
    );

    this.logger.warn(`${offlineIds.length} device(s) went offline`);
  }

  // ─── Heartbeat info ───────────────────────────────────────────────────────

  /**
   * Qurilmaning oxirgi heartbeat ma'lumotlari
   */
  async getHeartbeatInfo(deviceId: string): Promise<{
    isAlive: boolean;
    ttl: number;
    uptime?: number;
    freeMemory?: number;
    signalStrength?: number;
    lastSeen?: string;
  }> {
    const key = HEARTBEAT_KEY(deviceId);
    const raw = await this.redis.get(key);
    const ttl = await this.redis.ttl(key);

    if (!raw) return { isAlive: false, ttl: 0 };

    const data = JSON.parse(raw);
    return {
      isAlive: true,
      ttl,
      ...data,
    };
  }
}
