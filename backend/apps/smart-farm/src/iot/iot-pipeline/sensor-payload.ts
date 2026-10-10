import { Types } from 'mongoose';
import { MqttSensorDataPayload, MqttSensorReading } from '../../libs/dto/iot-pipeline.dto';

export const MAX_READINGS_PER_MESSAGE = 32;
export const TIMESTAMP_PAST_TOLERANCE_MS = 24 * 60 * 60 * 1000;
export const TIMESTAMP_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

const isObjectIdString = (value: unknown): value is string =>
  typeof value === 'string' && Types.ObjectId.isValid(value) && value.length === 24;

export function deviceIdFromTopic(topic: string): string | null {
  const parts = topic.split('/');
  if (parts.length !== 4 || parts[0] !== 'sf' || parts[1] !== 'devices') return null;
  return parts[2];
}

export function isSensorEnvelope(value: unknown): value is MqttSensorDataPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  return (
    isObjectIdString(payload.deviceId) &&
    typeof payload.apiKey === 'string' &&
    payload.apiKey.length > 0 &&
    Array.isArray(payload.readings) &&
    payload.readings.length > 0 &&
    payload.readings.length <= MAX_READINGS_PER_MESSAGE
  );
}

export function isUsableReading(value: unknown): value is MqttSensorReading {
  if (!value || typeof value !== 'object') return false;
  const reading = value as Record<string, unknown>;
  return (
    isObjectIdString(reading.sensorId) &&
    typeof reading.value === 'number' &&
    Number.isFinite(reading.value)
  );
}

export function resolveRecordedAt(raw: unknown, receivedAt: Date): Date {
  const now = receivedAt.getTime();
  const plausible = (ms: number) =>
    ms >= now - TIMESTAMP_PAST_TOLERANCE_MS && ms <= now + TIMESTAMP_FUTURE_TOLERANCE_MS;

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (plausible(raw)) return new Date(raw);
    if (plausible(raw * 1000)) return new Date(raw * 1000);
    return receivedAt;
  }
  if (typeof raw === 'string' && raw.length > 0) {
    const parsed = Date.parse(raw);
    if (Number.isFinite(parsed) && plausible(parsed)) return new Date(parsed);
  }
  return receivedAt;
}
