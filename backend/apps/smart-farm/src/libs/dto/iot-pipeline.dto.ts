/**
 * Qurilma (ESP32/Raspberry Pi) MQTT orqali yuboradigan payload formatlar.
 *
 * ─── Sensor data payload ──────────────────────────────────────────────────
 * Topic: sf/devices/{deviceId}/sensors
 *
 * {
 *   "apiKey": "sf_a3f9d2c1...",
 *   "deviceId": "64abc...",
 *   "timestamp": "2026-06-07T10:00:00.000Z",
 *   "readings": [
 *     { "sensorId": "64xyz...", "type": "TEMPERATURE", "value": 24.5, "unit": "°C" },
 *     { "sensorId": "64abc...", "type": "HUMIDITY",    "value": 78.2, "unit": "%" }
 *   ]
 * }
 *
 * ─── Heartbeat payload ───────────────────────────────────────────────────
 * Topic: sf/devices/{deviceId}/heartbeat
 *
 * {
 *   "apiKey": "sf_a3f9d2c1...",
 *   "deviceId": "64abc...",
 *   "timestamp": "2026-06-07T10:00:00.000Z",
 *   "uptime": 3600,
 *   "freeMemory": 45000
 * }
 *
 * ─── Status payload ──────────────────────────────────────────────────────
 * Topic: sf/devices/{deviceId}/status
 *
 * {
 *   "apiKey": "sf_a3f9d2c1...",
 *   "deviceId": "64abc...",
 *   "status": "ONLINE" | "OFFLINE" | "MAINTENANCE" | "ERROR",
 *   "reason": "Power failure"
 * }
 */

export interface MqttSensorReading {
  sensorId: string;
  type: string;
  value: number;
  unit: string;
}

export interface MqttSensorDataPayload {
  apiKey: string;
  deviceId: string;
  timestamp: string;
  readings: MqttSensorReading[];
}

export interface MqttHeartbeatPayload {
  apiKey: string;
  deviceId: string;
  timestamp: string;
  uptime: number; // soniya
  freeMemory: number; // byte
  signalStrength?: number; // dBm (WiFi signal kuchi)
}

export interface MqttStatusPayload {
  apiKey: string;
  deviceId: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
  reason?: string;
}

/**
 * WebSocket orqali frontendga yuboriladigan real-time event
 */
export interface WsSensorUpdateEvent {
  type: 'SENSOR_UPDATE';
  greenHouseId: string;
  deviceId: string;
  sensorId: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface WsAlertEvent {
  type: 'ALERT';
  greenHouseId: string;
  alertId: string;
  alertType: string;
  severity: string;
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
}

export interface WsDeviceStatusEvent {
  type: 'DEVICE_STATUS';
  deviceId: string;
  deviceName: string;
  status: string;
  timestamp: string;
}
