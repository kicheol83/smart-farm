import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MessageBuffersService } from './message-buffers.service';
import { IotPipelineService } from '../../iot/iot-pipeline/iot-pipeline.service';

class FakeRedis {
  private data = new Map<string, any>();
  calls: string[] = [];
  forceSize: number | null = null;

  private hash(key: string): Map<string, string> {
    if (!this.data.has(key)) this.data.set(key, new Map());
    return this.data.get(key);
  }
  private list(key: string): string[] {
    if (!this.data.has(key)) this.data.set(key, []);
    return this.data.get(key);
  }
  private zset(key: string): Map<string, number> {
    if (!this.data.has(key)) this.data.set(key, new Map());
    return this.data.get(key);
  }

  async hlen(key: string) { this.calls.push('hlen'); return this.forceSize ?? this.hash(key).size; }
  async hset(key: string, field: string, value: string) { this.hash(key).set(field, value); return 1; }
  async hget(key: string, field: string) { return this.hash(key).get(field) ?? null; }
  async hdel(key: string, field: string) { return this.hash(key).delete(field) ? 1 : 0; }
  async zadd(key: string, score: number, member: string) { this.zset(key).set(member, Number(score)); return 1; }
  async zrem(key: string, member: string) { return this.zset(key).delete(member) ? 1 : 0; }
  async zcard(key: string) { return this.zset(key).size; }
  async zrangebyscore(key: string, min: string, max: number, _l?: string, offset = 0, count = Infinity) {
    return [...this.zset(key).entries()]
      .filter(([, s]) => (min === '-inf' || s >= Number(min)) && s <= Number(max))
      .sort((a, b) => a[1] - b[1])
      .map(([m]) => m)
      .slice(offset, offset + count);
  }
  async llen(key: string) { this.calls.push('llen'); return this.forceSize ?? this.list(key).length; }
  async rpush(key: string, value: string) { this.list(key).push(value); return this.list(key).length; }
  async lrange(key: string, start: number, stop: number) {
    this.calls.push('lrange');
    const l = this.list(key);
    return l.slice(start, stop === -1 ? undefined : stop + 1);
  }
  async lrem(key: string, _count: number, value: string) {
    const l = this.list(key);
    const i = l.indexOf(value);
    if (i >= 0) l.splice(i, 1);
    return i >= 0 ? 1 : 0;
  }
  async del(key: string) { this.data.delete(key); return 1; }
  multi() {
    const ops: [string, any[]][] = [];
    const chain: any = new Proxy(
      {},
      {
        get: (_t, prop: string) =>
          prop === 'exec'
            ? async () => {
                const out = [];
                for (const [m, a] of ops) out.push([null, await (this as any)[m](...a)]);
                return out;
              }
            : (...args: any[]) => {
                ops.push([prop, args]);
                return chain;
              },
      },
    );
    return chain;
  }
}

const query = <T>(value: T) => ({ exec: async () => value, select: () => ({ exec: async () => value }) });

describe('sensor message retry and dead letter queue', () => {
  const deviceId = new Types.ObjectId();
  const tempSensor = new Types.ObjectId();
  const soilSensor = new Types.ObjectId();
  const T0 = new Date('2026-10-11T00:00:00.000Z').getTime();

  let redis: FakeRedis;
  let buffer: MessageBuffersService;
  let pipeline: IotPipelineService;
  let stored: { create: jest.Mock };
  let failingSensors: Set<string>;
  let validateApiKey: jest.Mock;
  let errorHandler: Record<string, jest.Mock>;

  const send = (timestamp: unknown = null) =>
    (pipeline as any).handleSensorData(
      `sf/devices/${String(deviceId)}/sensors`,
      Buffer.from(
        JSON.stringify({
          apiKey: 'key',
          deviceId: String(deviceId),
          timestamp,
          readings: [
            { sensorId: String(tempSensor), type: 'TEMPERATURE', unit: '°C', value: 21.5 },
            { sensorId: String(soilSensor), type: 'SOIL_MOISTURE', unit: '%', value: 40 },
          ],
        }),
      ),
    );

  const rowsFor = (sensor: Types.ObjectId) =>
    stored.create.mock.calls.map(([row]) => row).filter((row) => String(row.sensorId) === String(sensor));

  const at = async (offsetMs: number) => {
    jest.setSystemTime(T0 + offsetMs);
    await buffer.retryPendingMessages();
  };

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval', 'queueMicrotask'] });
    jest.setSystemTime(T0);
    failingSensors = new Set();
    validateApiKey = jest.fn(async () => deviceId);
    errorHandler = { handleMqttParseError: jest.fn(), handleAuthError: jest.fn(async () => undefined), handleSensorSaveError: jest.fn(async () => undefined) };
    redis = new FakeRedis();
    buffer = new MessageBuffersService(redis as any);
    stored = {
      create: jest.fn(async (row: any) => {
        if (failingSensors.has(String(row.sensorId))) throw new Error('MongoServerSelectionError: connection refused');
        return row;
      }),
    };

    pipeline = new IotPipelineService(
      { registerHandler: jest.fn() } as any,
      { validateApiKey } as any,
      { insert: jest.fn(async () => undefined) } as any,
      buffer,
      { check: jest.fn(async () => ({ isAnomaly: false })) } as any,
      { apply: jest.fn(async (_id: string, v: number) => v) } as any,
      { isAllowed: jest.fn(async () => true) } as any,
      errorHandler as any,
      { evaluateRules: jest.fn(async () => undefined) } as any,
      stored as any,
      {
        find: () =>
          query([
            { _id: tempSensor, sensorType: 'TEMPERATURE', sensorsUnit: '°C', deviceId },
            { _id: soilSensor, sensorType: 'SOIL_MOISTURE', sensorsUnit: '%', deviceId },
          ]),
      } as any,
      { findById: () => query({ _id: deviceId, deviceName: 'Hub', greenHouseId: new Types.ObjectId() }) } as any,
      { find: () => query([]) } as any,
      { create: jest.fn() } as any,
      { findById: () => query(null) } as any,
      { findById: () => query(null) } as any,
    );
    pipeline.onModuleInit();
    await buffer.onModuleInit();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves a reading that failed the first time, once, at the time it arrived', async () => {
    failingSensors.add(String(soilSensor));
    await send();
    expect(rowsFor(soilSensor)).toHaveLength(1);
    failingSensors.clear();

    await at(31_000);

    expect(rowsFor(tempSensor)).toHaveLength(1);
    expect(rowsFor(soilSensor)).toHaveLength(2);
    expect(rowsFor(soilSensor)[1].recordedAt.toISOString()).toBe(new Date(T0).toISOString());
    expect(await buffer.getStats()).toEqual({ pending: 0, retrying: 0, deadLetter: 0 });
  });

  it('retries a message whose device key could not be checked while the database was down', async () => {
    validateApiKey.mockRejectedValueOnce(new Error('MongoServerSelectionError: getaddrinfo EAI_AGAIN mongo'));
    await send();
    expect(stored.create).not.toHaveBeenCalled();
    expect((await buffer.getStats()).retrying).toBe(1);
    expect(errorHandler.handleAuthError).not.toHaveBeenCalled();

    await at(31_000);

    expect(rowsFor(tempSensor)).toHaveLength(1);
    expect(rowsFor(soilSensor)).toHaveLength(1);
    expect(await buffer.getStats()).toEqual({ pending: 0, retrying: 0, deadLetter: 0 });
  });

  it('drops a message with an invalid device key without retrying it', async () => {
    validateApiKey.mockRejectedValueOnce(new UnauthorizedException('Invalid device API key.'));
    await send();

    expect(stored.create).not.toHaveBeenCalled();
    expect(errorHandler.handleAuthError).toHaveBeenCalledTimes(1);
    expect(await buffer.getStats()).toEqual({ pending: 0, retrying: 0, deadLetter: 0 });
  });

  it('waits for the backoff before retrying', async () => {
    failingSensors.add(String(soilSensor));
    await send();

    await at(5_000);

    expect(rowsFor(soilSensor)).toHaveLength(1);
    expect((await buffer.getStats()).retrying).toBe(1);
  });

  it('moves a message that keeps failing to the dead letter queue after three retries', async () => {
    failingSensors.add(String(soilSensor));
    await send();

    await at(31_000);
    await at(31_000 + 61_000);
    await at(31_000 + 61_000 + 121_000);

    expect(rowsFor(soilSensor)).toHaveLength(4);
    expect(rowsFor(tempSensor)).toHaveLength(1);
    expect(await buffer.getStats()).toEqual({ pending: 0, retrying: 0, deadLetter: 1 });
    const [dead] = await buffer.getDeadLetterMessages(1);
    expect(dead.failReason).toMatch(/connection refused/);
    expect(dead.retryCount).toBe(3);
  });

  it('retries a message left in flight when the process stopped mid-way', async () => {
    const payload = JSON.stringify({
      apiKey: 'key',
      deviceId: String(deviceId),
      timestamp: null,
      readings: [{ sensorId: String(soilSensor), type: 'SOIL_MOISTURE', unit: '%', value: 33 }],
    });
    await buffer.enqueue(`sf/devices/${String(deviceId)}/sensors`, payload);

    await at(5 * 60_000 + 1_000);
    await at(5 * 60_000 + 1_000 + 31_000);

    expect(rowsFor(soilSensor)).toHaveLength(1);
    expect((await buffer.getStats()).pending).toBe(0);
  });

  it('acknowledges a message without reading the whole buffer', async () => {
    for (let i = 0; i < 20; i++) await send();
    redis.calls = [];

    await send();

    expect(redis.calls).not.toContain('lrange');
    expect((await buffer.getStats()).pending).toBe(0);
  });

  it('still stores readings when the buffer is full', async () => {
    redis.forceSize = 10_000;

    await send();

    expect(rowsFor(soilSensor)).toHaveLength(1);
    expect(rowsFor(tempSensor)).toHaveLength(1);
  });

  it('moves messages left in the old pending list into the retry queue on startup', async () => {
    await redis.rpush(
      'iot:buffer:pending',
      JSON.stringify({
        id: 'old-1',
        topic: `sf/devices/${String(deviceId)}/sensors`,
        payload: JSON.stringify({
          apiKey: 'key',
          deviceId: String(deviceId),
          timestamp: null,
          readings: [{ sensorId: String(tempSensor), type: 'TEMPERATURE', unit: '°C', value: 19 }],
        }),
        receivedAt: new Date(T0 - 60_000).toISOString(),
        retryCount: 1,
      }),
    );

    await buffer.onModuleInit();
    await at(1_000);

    expect(rowsFor(tempSensor)).toHaveLength(1);
    expect(await redis.llen('iot:buffer:pending')).toBe(0);
  });
});
