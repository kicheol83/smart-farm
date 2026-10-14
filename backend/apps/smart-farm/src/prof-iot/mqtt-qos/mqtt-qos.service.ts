import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MqttPublishOptions {
  qos: 0 | 1 | 2;
  retain: boolean;
}

export const MQTT_QOS_CONFIG: Record<string, MqttPublishOptions> = {
  SENSOR_DATA: { qos: 1, retain: false },

  HEARTBEAT: { qos: 0, retain: false },

  COMMAND: { qos: 1, retain: false },

  DEVICE_STATUS: { qos: 1, retain: true },

  SERVER_STATUS: { qos: 1, retain: true },
};

export const MQTT_CONNECTION_OPTIONS = {
  clean: false,
  reconnectPeriod: 5000,
  connectTimeout: 10000,
  keepalive: 60,
  queueQoSZero: true,
};

@Injectable()
export class MqttQosService {
  private readonly logger = new Logger(MqttQosService.name);

  constructor(private readonly config: ConfigService) {}

  getPublishOptions(
    topicType: keyof typeof MQTT_QOS_CONFIG,
  ): MqttPublishOptions {
    const options = MQTT_QOS_CONFIG[topicType];
    if (!options) {
      this.logger.warn(`Unknown topic type: ${topicType}, using QoS 1`);
      return { qos: 1, retain: false };
    }
    return options;
  }

  getSubscribeQos(topicType: string): 0 | 1 | 2 {
    const config = MQTT_QOS_CONFIG[topicType];
    return config?.qos ?? 1;
  }

  getClientId(): string {
    const env = this.config.get<string>('NODE_ENV', 'development');
    return `smart-farm-nestjs-${env}`;
  }
}
