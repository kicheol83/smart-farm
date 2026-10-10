import { Types } from 'mongoose';
import { ActuatorService } from './actuator.service';
import { ActuatorStatus } from '../libs/dto/ops-context-dto/actuator/actuator';

type Doc = Record<string, any>;

const query = <T>(value: T) => ({
  exec: async () => value,
  select: () => ({ exec: async () => value }),
});

function applyUpdate(doc: Doc, update: Doc): void {
  const set = update.$set ?? (update.$unset ? {} : update);
  for (const [key, value] of Object.entries(set)) {
    if (value !== undefined) doc[key] = value;
  }
  for (const key of Object.keys(update.$unset ?? {})) delete doc[key];
}

function actuatorStore(docs: Doc[]) {
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  return {
    byId,
    findById: (id: unknown) => {
      const doc = byId.get(String(id));
      return query(doc ? { ...doc } : null);
    },
    findByIdAndUpdate: (id: unknown, update: Doc) => {
      const doc = byId.get(String(id));
      if (doc) applyUpdate(doc, update);
      return query(doc ? { ...doc } : null);
    },
    find: (filter: Doc) =>
      query(
        [...byId.values()].filter(
          (d) =>
            d.actuatorStatus === filter.actuatorStatus &&
            d.autoOffAt instanceof Date &&
            d.autoOffAt <= filter.autoOffAt.$lte,
        ),
      ),
  };
}

function ruleStore(docs: Doc[]) {
  return {
    docs,
    find: () => query(docs),
    findOneAndUpdate: (filter: Doc, update: Doc) => {
      const doc = docs.find((d) => String(d._id) === String(filter._id));
      if (!doc) return query(null);
      const cutoff: Date = filter.$or[2].lastTriggeredAt.$lte;
      const free = doc.lastTriggeredAt == null || doc.lastTriggeredAt <= cutoff;
      if (!free) return query(null);
      Object.assign(doc, update.$set);
      return query({ ...doc });
    },
  };
}

const minutesFromNow = (date: Date) => (date.getTime() - Date.now()) / 60000;

describe('automation rule → actuator → device', () => {
  const greenHouseId = new Types.ObjectId();
  const deviceId = new Types.ObjectId();
  const pumpId = new Types.ObjectId();
  const fanId = new Types.ObjectId();
  const ruleId = new Types.ObjectId();

  let actuators: ReturnType<typeof actuatorStore>;
  let rules: ReturnType<typeof ruleStore>;
  let waterUsage: { create: jest.Mock };
  let mqtt: { publish: jest.Mock };
  let service: ActuatorService;

  const pump = () => actuators.byId.get(String(pumpId))!;
  const relayCommands = () =>
    mqtt.publish.mock.calls.map(([topic, body]) => ({ topic, ...body }));

  const setup = (ruleOverrides: Doc = {}) => {
    actuators = actuatorStore([
      {
        _id: pumpId,
        actuatorName: 'Pump',
        actuatorType: 'WATER_PUMP',
        actuatorStatus: ActuatorStatus.OFF,
        deviceId,
        greenHouseId,
      },
      {
        _id: fanId,
        actuatorName: 'Fan',
        actuatorType: 'FAN',
        actuatorStatus: ActuatorStatus.OFF,
        deviceId,
        greenHouseId,
      },
    ]);
    rules = ruleStore([
      {
        _id: ruleId,
        ruleName: 'Dry soil',
        actuatorId: pumpId,
        triggerSensorType: 'SOIL_MOISTURE',
        triggerCondition: 'BELOW',
        triggerThreshold: 35,
        actionDurationMinutes: 5,
        enabled: true,
        ...ruleOverrides,
      },
    ]);
    waterUsage = { create: jest.fn(async () => ({})) };
    mqtt = { publish: jest.fn() };
    service = new ActuatorService(
      actuators as any,
      rules as any,
      waterUsage as any,
      mqtt as any,
    );
  };

  beforeEach(() => {
    delete process.env.PUMP_MAX_ON_MINUTES;
    delete process.env.RULE_COOLDOWN_MINUTES;
    setup();
  });

  it('switches the pump on and sends RELAY_ON to the device', async () => {
    await service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 20);

    expect(pump().actuatorStatus).toBe(ActuatorStatus.ON);
    expect(minutesFromNow(pump().autoOffAt)).toBeCloseTo(5, 1);
    expect(relayCommands()).toEqual([
      expect.objectContaining({
        topic: `sf/devices/${String(deviceId)}/commands`,
        commandType: 'RELAY_ON',
        payload: expect.objectContaining({ actuatorId: String(pumpId) }),
      }),
    ]);
    expect(relayCommands()[0].payload.onSec).toBeGreaterThanOrEqual(299);
    expect(relayCommands()[0].payload.onSec).toBeLessThanOrEqual(300);
  });

  it('caps a rule without a duration at PUMP_MAX_ON_MINUTES', async () => {
    setup({ actionDurationMinutes: undefined });

    await service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 20);

    expect(minutesFromNow(pump().autoOffAt)).toBeCloseTo(30, 1);
  });

  it('caps a manual pump run that is longer than the limit', async () => {
    process.env.PUMP_MAX_ON_MINUTES = '15';

    await service.toggle({
      actuatorId: String(pumpId),
      status: ActuatorStatus.ON,
      autoOffAfterMinutes: 240,
    } as any);

    expect(minutesFromNow(pump().autoOffAt)).toBeCloseTo(15, 1);
  });

  it('switches the pump on once when two dry readings arrive together', async () => {
    await Promise.all([
      service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 20),
      service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 21),
    ]);

    expect(relayCommands().filter((c) => c.commandType === 'RELAY_ON')).toHaveLength(1);
  });

  it('turns the pump off when the timer ends, records water and clears the timer', async () => {
    await service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 20);
    pump().autoOffAt = new Date(Date.now() - 1000);
    pump().lastToggledAt = new Date(Date.now() - 5 * 60000);

    await service.autoOffExpired();

    expect(pump().actuatorStatus).toBe(ActuatorStatus.OFF);
    expect(pump().autoOffAt).toBeUndefined();
    expect(relayCommands().map((c) => c.commandType)).toEqual(['RELAY_ON', 'RELAY_OFF']);
    expect(waterUsage.create).toHaveBeenCalledWith(
      expect.objectContaining({ waterAmount: 60, durationMinutes: 5 }),
    );
  });

  it('does not restart the pump inside the cooldown, and does after it', async () => {
    await service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 20);
    await service.toggle({ actuatorId: String(pumpId), status: ActuatorStatus.OFF } as any);

    await service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 20);
    expect(pump().actuatorStatus).toBe(ActuatorStatus.OFF);

    rules.docs[0].lastTriggeredAt = new Date(Date.now() - 11 * 60000);
    await service.evaluateRules(String(greenHouseId), 'SOIL_MOISTURE', 20);
    expect(pump().actuatorStatus).toBe(ActuatorStatus.ON);
  });

  it('keeps a manual fan ON when an old timer was left on the document', async () => {
    const fan = actuators.byId.get(String(fanId))!;
    fan.autoOffAt = new Date(Date.now() - 60 * 60000);

    await service.toggle({ actuatorId: String(fanId), status: ActuatorStatus.ON } as any);
    await service.autoOffExpired();

    expect(fan.actuatorStatus).toBe(ActuatorStatus.ON);
    expect(fan.autoOffAt).toBeUndefined();
  });

  it('does not drive the pump relay for a fan', async () => {
    await service.toggle({ actuatorId: String(fanId), status: ActuatorStatus.ON } as any);

    expect(mqtt.publish).not.toHaveBeenCalled();
  });
});
