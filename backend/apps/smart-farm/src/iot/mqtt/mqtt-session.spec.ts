import { EventEmitter } from 'events';
import * as mqtt from 'mqtt';
import { MqttService } from './mqtt.service';

jest.mock('mqtt', () => ({ connect: jest.fn() }));

const connectMock = mqtt.connect as unknown as jest.Mock;

const config = (values: Record<string, string> = {}) =>
  ({
    getOrThrow: (key: string) => values[key] ?? 'mqtt://broker:1883',
    get: (key: string) => values[key],
  }) as any;

function brokerWithQueuedMessage(topic: string, payload: string) {
  connectMock.mockImplementation(() => {
    const client: any = new EventEmitter();
    client.connected = true;
    client.subscribe = jest.fn();
    client.end = jest.fn();
    queueMicrotask(() => {
      client.emit('connect');
      client.emit('message', topic, Buffer.from(payload));
    });
    return client;
  });
}

async function runLifecycle(providers: any[]) {
  for (const hook of ['onModuleInit', 'onApplicationBootstrap']) {
    for (const provider of providers) {
      if (typeof provider[hook] === 'function') await provider[hook]();
    }
  }
}

describe('MQTT session across backend restarts', () => {
  beforeEach(() => {
    connectMock.mockReset();
  });

  it('delivers a message the broker kept while the backend was down', async () => {
    brokerWithQueuedMessage('sf/devices/abc/sensors', 'queued while down');
    const mqttService = new MqttService(config());
    const received: string[] = [];
    const pipeline = {
      onModuleInit: () =>
        mqttService.registerHandler('sf/devices/+/sensors', async (_t, payload) => {
          received.push(payload.toString());
        }),
    };

    await runLifecycle([mqttService, pipeline]);
    await new Promise((resolve) => setImmediate(resolve));

    expect(received).toEqual(['queued while down']);
  });

  it('reconnects with the same client id and a persistent session', async () => {
    brokerWithQueuedMessage('sf/devices/abc/heartbeat', '{}');

    await runLifecycle([new MqttService(config())]);
    await runLifecycle([new MqttService(config())]);

    const [first, second] = connectMock.mock.calls.map(([, options]) => options);
    expect(first.clientId).toBe(second.clientId);
    expect(first.clean).toBe(false);
  });

  it('takes the client id from MQTT_CLIENT_ID when it is set', async () => {
    brokerWithQueuedMessage('sf/devices/abc/heartbeat', '{}');

    await runLifecycle([new MqttService(config({ MQTT_CLIENT_ID: 'smart-farm-backend-2' }))]);

    expect(connectMock.mock.calls[0][1].clientId).toBe('smart-farm-backend-2');
  });
});
