import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * MQTT QoS + Persistence
 *
 * QoS darajalari:
 *   QoS 0 — "fire and forget" — yuborildi, yetib bordi yoki yo'q
 *   QoS 1 — "at least once"  — kamida bir marta yetib boradi (duplicate bo'lishi mumkin)
 *   QoS 2 — "exactly once"   — aynan bir marta (eng sekin, IoT da kam ishlatiladi)
 *
 * Smart Farm uchun:
 *   Sensor data   → QoS 1 (muhim, yo'qolmasin, duplicate bo'lsa ham saqlash mumkin)
 *   Heartbeat     → QoS 0 (yo'qolsa ham keyingisi keladi)
 *   Command       → QoS 1 (relay buyrug'i albatta yetib borsin)
 *
 * Persistence:
 *   retain: true  → broker oxirgi xabarni saqlaydi
 *                   yangi client ulanganda darhol oxirgi qiymatni oladi
 *   retain: false → faqat online clientlar oladi
 *
 * Persistent Session (cleanSession: false):
 *   NestJS offline bo'lsa ham broker subscription ni saqlaydi
 *   Qayta ulanganda offline davrdagi xabarlar keladi
 */

export interface MqttPublishOptions {
  qos: 0 | 1 | 2;
  retain: boolean;
}

export const MQTT_QOS_CONFIG: Record<string, MqttPublishOptions> = {
  // Sensor data — muhim, yo'qolmasin
  SENSOR_DATA: { qos: 1, retain: false },

  // Heartbeat — tez, yo'qolsa muammo emas
  HEARTBEAT: { qos: 0, retain: false },

  // Command — albatta yetib borsin (relay buyrug'i)
  COMMAND: { qos: 1, retain: false },

  // Device status — retain: true, yangi client oxirgi statusni olsin
  DEVICE_STATUS: { qos: 1, retain: true },

  // Server status — retain: true, broker saqlaydi
  SERVER_STATUS: { qos: 1, retain: true },
};

/**
 * Mosquitto persistene konfiguratsiyasi:
 * mosquitto.conf:
 *
 *   persistence true
 *   persistence_location /mosquitto/data/
 *   persistence_file mosquitto.db
 *
 * NestJS client:
 *   cleanSession: false    → broker subscriptionni saqlasin
 *   reconnectPeriod: 5000  → 5s da qayta ulanish
 */
export const MQTT_CONNECTION_OPTIONS = {
  clean: false, // persistent session — offline xabarlar saqlanadi
  reconnectPeriod: 5000, // 5 soniyada qayta ulanish
  connectTimeout: 10000, // 10 soniya timeout
  keepalive: 60, // 60s keepalive
  queueQoSZero: true, // QoS 0 xabarlarni ham queue da saqlash
};

@Injectable()
export class MqttQosService {
  private readonly logger = new Logger(MqttQosService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Topic uchun to'g'ri QoS va retain option qaytaradi
   */
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

  /**
   * Subscription uchun QoS darajasi
   * Subscribe qilingan QoS dan yuqori bo'lsa broker pasaytiradi
   */
  getSubscribeQos(topicType: string): 0 | 1 | 2 {
    const config = MQTT_QOS_CONFIG[topicType];
    return config?.qos ?? 1;
  }

  /**
   * Client ID — unique bo'lishi shart
   * Persistent session uchun har doim bir xil ID ishlatiladi
   */
  getClientId(): string {
    const env = this.config.get<string>('NODE_ENV', 'development');
    return `smart-farm-nestjs-${env}`;
  }
}
