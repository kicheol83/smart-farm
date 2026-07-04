import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { MqttClient } from 'mqtt';

export type MqttMessageHandler = (
  topic: string,
  payload: Buffer,
) => Promise<void>;

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client!: MqttClient;
  private readonly handlers = new Map<string, MqttMessageHandler>();

  static readonly TOPICS = {
    SENSOR_DATA: (deviceId: string) => `sf/devices/${deviceId}/sensors`,
    HEARTBEAT: (deviceId: string) => `sf/devices/${deviceId}/heartbeat`,
    STATUS: (deviceId: string) => `sf/devices/${deviceId}/status`,
    COMMAND: (deviceId: string) => `sf/devices/${deviceId}/commands`,
    CONFIG: (deviceId: string) => `sf/devices/${deviceId}/config`,
    ALL_SENSORS: 'sf/devices/+/sensors',
    ALL_HEARTBEATS: 'sf/devices/+/heartbeat',
    ALL_STATUS: 'sf/devices/+/status',
  } as const;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.client?.end(true);
    this.logger.log('MQTT disconnected');
  }

  private async connect(): Promise<void> {
    const brokerUrl = this.config.getOrThrow<string>('MQTT_BROKER_URL');
    const username = this.config.get<string>('MQTT_USERNAME');
    const password = this.config.get<string>('MQTT_PASSWORD');
    const clientId = `smart-farm-server-${Date.now()}`;

    this.client = mqtt.connect(brokerUrl, {
      clientId,
      username,
      password,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
      will: {
        topic: 'sf/server/status',
        payload: JSON.stringify({ status: 'offline', clientId }),
        qos: 1,
        retain: true,
      },
    });

    this.client.on('connect', () => {
      this.logger.log(
        `MQTT connected | broker=${brokerUrl} | clientId=${clientId}`,
      );
      this.subscribeToAllDevices();
    });

    this.client.on('message', async (topic, payload) => {
      await this.dispatch(topic, payload);
    });

    this.client.on('reconnect', () => {
      this.logger.warn('MQTT reconnecting...');
    });

    this.client.on('error', (err) => {
      this.logger.error(`MQTT error: ${err.message}`);
    });

    this.client.on('offline', () => {
      this.logger.warn('MQTT broker offline');
    });
  }

  private subscribeToAllDevices(): void {
    const topics = [
      MqttService.TOPICS.ALL_SENSORS,
      MqttService.TOPICS.ALL_HEARTBEATS,
      MqttService.TOPICS.ALL_STATUS,
    ];

    this.client.subscribe(topics, { qos: 1 }, (err) => {
      if (err) {
        this.logger.error(`MQTT subscribe error: ${err.message}`);
      } else {
        this.logger.log(`Subscribed to: ${topics.join(', ')}`);
      }
    });
  }

  registerHandler(topicPattern: string, handler: MqttMessageHandler): void {
    this.handlers.set(topicPattern, handler);
    this.logger.log(`Handler registered | topic=${topicPattern}`);
  }

  publish(topic: string, payload: object): void {
    if (!this.client?.connected) {
      this.logger.warn(`MQTT not connected — cannot publish to ${topic}`);
      return;
    }

    this.client.publish(
      topic,
      JSON.stringify(payload),
      { qos: 1, retain: false },
      (err) => {
        if (err) {
          this.logger.error(
            `MQTT publish error | topic=${topic}: ${err.message}`,
          );
        } else {
          this.logger.debug(`Published | topic=${topic}`);
        }
      },
    );
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }


  private async dispatch(topic: string, payload: Buffer): Promise<void> {
    for (const [pattern, handler] of this.handlers) {
      if (this.matchTopic(pattern, topic)) {
        try {
          await handler(topic, payload);
        } catch (err) {
          this.logger.error(`Handler error | topic=${topic}: ${err}`);
        }
        return;
      }
    }
    this.logger.debug(`No handler for topic: ${topic}`);
  }

 
  private matchTopic(pattern: string, topic: string): boolean {
    if (pattern === topic) return true;

    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '#') return true;
      if (patternParts[i] === '+') continue;
      if (patternParts[i] !== topicParts[i]) return false;
    }

    return patternParts.length === topicParts.length;
  }
}
