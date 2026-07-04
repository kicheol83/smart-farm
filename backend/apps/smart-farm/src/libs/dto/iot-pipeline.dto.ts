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
  uptime: number;
  freeMemory: number;
  signalStrength?: number;
}

export interface MqttStatusPayload {
  apiKey: string;
  deviceId: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
  reason?: string;
}

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
