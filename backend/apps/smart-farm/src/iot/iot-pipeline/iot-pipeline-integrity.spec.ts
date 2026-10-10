import { Types } from 'mongoose';
import { IotPipelineService } from './iot-pipeline.service';
import { resolveRecordedAt } from './sensor-payload';

const query = <T>(value: T) => ({
  exec: async () => value,
  select: () => ({ exec: async () => value }),
});

describe('sensor message integrity', () => {
  const deviceA = new Types.ObjectId();
  const deviceB = new Types.ObjectId();
  const greenHouseId = new Types.ObjectId();
  const tempA = new Types.ObjectId();
  const soilA = new Types.ObjectId();
  const soilB = new Types.ObjectId();

  const sensors = [
    { _id: tempA, sensorType: 'TEMPERATURE', sensorsUnit: '°C', deviceId: deviceA },
    { _id: soilA, sensorType: 'SOIL_MOISTURE', sensorsUnit: '%', deviceId: deviceA },
    { _id: soilB, sensorType: 'SOIL_MOISTURE', sensorsUnit: '%', deviceId: deviceB },
  ];

  let stored: { create: jest.Mock };
  let timeSeries: { insert: jest.Mock };
  let deviceAuth: { validateApiKey: jest.Mock };
  let actuators: { evaluateRules: jest.Mock };
  let errors: Record<string, jest.Mock>;
  let pipeline: IotPipelineService;

  beforeEach(() => {
    stored = { create: jest.fn(async () => ({})) };
    timeSeries = { insert: jest.fn(async () => undefined) };
    deviceAuth = {
      validateApiKey: jest.fn(async (key: string) => {
        if (key === 'key-a') return deviceA;
        throw new Error('Invalid device API key.');
      }),
    };
    actuators = { evaluateRules: jest.fn(async () => undefined) };
    errors = {
      handleMqttParseError: jest.fn(async () => undefined),
      handleAuthError: jest.fn(async () => undefined),
      handleSensorSaveError: jest.fn(async () => undefined),
    };

    const sensorModel = {
      find: (filter: any) =>
        query(
          sensors.filter(
            (s) =>
              filter._id.$in.some((id: Types.ObjectId) => String(id) === String(s._id)) &&
              String(s.deviceId) === String(filter.deviceId),
          ),
        ),
    };

    pipeline = new IotPipelineService(
      { registerHandler: jest.fn() } as any,
      deviceAuth as any,
      timeSeries as any,
      {
        enqueue: jest.fn(async () => 'message-1'),
        acknowledge: jest.fn(async () => undefined),
        markFailed: jest.fn(async () => undefined),
      } as any,
      { check: jest.fn(async () => ({ isAnomaly: false })) } as any,
      { apply: jest.fn(async (_id: string, value: number) => value) } as any,
      { isAllowed: jest.fn(async () => true) } as any,
      errors as any,
      actuators as any,
      stored as any,
      sensorModel as any,
      { findById: () => query({ _id: deviceA, deviceName: 'Hub A', greenHouseId }) } as any,
      { find: () => query([]) } as any,
      { create: jest.fn() } as any,
      { findById: () => query(null) } as any,
      { findById: () => query(null) } as any,
    );
  });

  const send = (payload: unknown, device = deviceA) =>
    (pipeline as any).handleSensorData(
      `sf/devices/${String(device)}/sensors`,
      Buffer.from(JSON.stringify(payload)),
    );

  const storedRows = () => stored.create.mock.calls.map(([row]) => row);

  it("drops a reading aimed at another device's sensor and keeps the rest", async () => {
    await send({
      apiKey: 'key-a',
      deviceId: String(deviceA),
      timestamp: new Date().toISOString(),
      readings: [
        { sensorId: String(soilA), type: 'SOIL_MOISTURE', unit: '%', value: 41 },
        { sensorId: String(soilB), type: 'SOIL_MOISTURE', unit: '%', value: 5 },
      ],
    });

    expect(storedRows().map((r) => String(r.sensorId))).toEqual([String(soilA)]);
    expect(actuators.evaluateRules).toHaveBeenCalledTimes(1);
  });

  it('uses the registered sensor type, not the type in the message', async () => {
    await send({
      apiKey: 'key-a',
      deviceId: String(deviceA),
      timestamp: new Date().toISOString(),
      readings: [{ sensorId: String(tempA), type: 'SOIL_MOISTURE', unit: '%', value: 12 }],
    });

    expect(storedRows()[0].sensorDataName).toBe('TEMPERATURE');
    expect(actuators.evaluateRules).toHaveBeenCalledWith(
      String(greenHouseId),
      'TEMPERATURE',
      12,
      undefined,
    );
  });

  it('stores a reading from a device without a real clock at the time it arrived', async () => {
    const before = Date.now();
    await send({
      apiKey: 'key-a',
      deviceId: String(deviceA),
      timestamp: 834_000_000,
      readings: [{ sensorId: String(soilA), type: 'SOIL_MOISTURE', unit: '%', value: 40 }],
    });

    const recordedAt: Date = storedRows()[0].recordedAt;
    expect(recordedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(recordedAt.getTime()).toBeLessThanOrEqual(Date.now());
    expect(timeSeries.insert.mock.calls[0][5]).toEqual(recordedAt);
  });

  it('rejects an apiKey that is not a string before looking it up', async () => {
    await send({
      apiKey: { $ne: null },
      deviceId: String(deviceA),
      timestamp: new Date().toISOString(),
      readings: [{ sensorId: String(soilA), type: 'SOIL_MOISTURE', unit: '%', value: 40 }],
    });

    expect(deviceAuth.validateApiKey).not.toHaveBeenCalled();
    expect(stored.create).not.toHaveBeenCalled();
  });

  it("rejects a message published on another device's topic", async () => {
    await send(
      {
        apiKey: 'key-a',
        deviceId: String(deviceA),
        timestamp: new Date().toISOString(),
        readings: [{ sensorId: String(soilA), type: 'SOIL_MOISTURE', unit: '%', value: 40 }],
      },
      deviceB,
    );

    expect(stored.create).not.toHaveBeenCalled();
    expect(errors.handleMqttParseError).toHaveBeenCalled();
  });

  it('skips readings whose value is not a number', async () => {
    await send({
      apiKey: 'key-a',
      deviceId: String(deviceA),
      timestamp: new Date().toISOString(),
      readings: [
        { sensorId: String(soilA), type: 'SOIL_MOISTURE', unit: '%', value: 'wet' },
        { sensorId: String(tempA), type: 'TEMPERATURE', unit: '°C', value: 22.5 },
      ],
    });

    expect(storedRows().map((r) => r.sensorDataName)).toEqual(['TEMPERATURE']);
  });
});

describe('resolveRecordedAt', () => {
  const receivedAt = new Date('2026-10-10T08:00:00.000Z');

  it.each([
    ['milliseconds', receivedAt.getTime() - 30_000, '2026-10-10T07:59:30.000Z'],
    ['unix seconds', Math.floor(receivedAt.getTime() / 1000) - 30, '2026-10-10T07:59:30.000Z'],
    ['ISO text', '2026-10-10T07:59:30.000Z', '2026-10-10T07:59:30.000Z'],
    ['seconds since 2000', 834_000_000, '2026-10-10T08:00:00.000Z'],
    ['far future', receivedAt.getTime() + 3_600_000, '2026-10-10T08:00:00.000Z'],
    ['missing', undefined, '2026-10-10T08:00:00.000Z'],
    ['garbage', 'yesterday', '2026-10-10T08:00:00.000Z'],
  ])('%s', (_label, raw, expected) => {
    expect(resolveRecordedAt(raw, receivedAt).toISOString()).toBe(expected);
  });
});
