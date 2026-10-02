const mqtt = require('mqtt');
const { FarmModel } = require('./lib/farm-model');

const BASE_VALUES = {
  TEMPERATURE: { base: 24, step: 0.4, min: 5, max: 45 },
  HUMIDITY: { base: 65, step: 1.5, min: 20, max: 100 },
  SOIL_MOISTURE: { base: 45, step: 1.2, min: 5, max: 95 },
  LIGHT: { base: 18000, step: 900, min: 0, max: 80000 },
  PH: { base: 6.5, step: 0.05, min: 4, max: 9 },
  CO2: { base: 600, step: 25, min: 350, max: 2000 },
  WATER_LEVEL: { base: 70, step: 1, min: 0, max: 100 },
  WATER_EC: { base: 1.8, step: 0.05, min: 0.2, max: 4 },
  RAIN: { base: 0, step: 0.2, min: 0, max: 20 },
};

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const brokerUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
const deviceId = required('DEVICE_ID');
const apiKey = required('API_KEY');
const intervalMs = Number(process.env.INTERVAL_MS || 2000);
const count = Number(process.env.COUNT || 60);
const mode = process.env.MODE || 'realistic';
const closedLoop = process.env.CLOSED_LOOP === 'true';
const apiUrl = process.env.API_URL || 'http://127.0.0.1:3010/graphql';
const pollMs = Number(process.env.POLL_MS || 5000);
const farm = new FarmModel({
  utcOffsetHours: Number(process.env.UTC_OFFSET_HOURS || 9),
  autoIrrigate: !closedLoop,
  soilStart: Number(process.env.SOIL_START || 55),
  dryingMultiplier: Number(process.env.DRYING_MULTIPLIER || 1),
});
let pumpOn = false;

async function pollActuators() {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-device-api-key': apiKey },
      body: JSON.stringify({ query: '{ getDeviceActuatorStates { actuatorName actuatorType desiredStatus } }' }),
    });
    const body = await response.json();
    if (body.errors) {
      console.error(`Actuator poll failed: ${body.errors[0].message}`);
      return;
    }
    const states = body.data.getDeviceActuatorStates;
    const watering = states.some(
      (state) => (state.actuatorType === 'WATER_PUMP' || state.actuatorType === 'SOLENOID_VALVE') && state.desiredStatus === 'ON',
    );
    if (watering !== pumpOn) {
      pumpOn = watering;
      farm.setIrrigating(pumpOn);
      console.log(`>>> PUMP ${pumpOn ? 'ON' : 'OFF'} (commanded by backend)`);
    }
  } catch (err) {
    console.error(`Actuator poll failed: ${err.message}`);
  }
}
const spikeEvery = Number(process.env.SPIKE_EVERY || 40);

const sensors = required('SENSORS')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const [sensorId, type, unit] = entry.split(':');
    const profile = BASE_VALUES[type];
    if (!sensorId || !type || !unit || !profile) {
      console.error(`Invalid SENSORS entry: ${entry} (expected sensorId:TYPE:unit)`);
      process.exit(1);
    }
    return { sensorId, type, unit, profile, value: profile.base };
  });

const client = mqtt.connect(brokerUrl, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `sf-simulator-${deviceId}-${Date.now()}`,
});

let sent = 0;

function nextValue(sensor, spike) {
  const { step, min, max } = sensor.profile;
  sensor.value += (Math.random() * 2 - 1) * step;
  sensor.value = Math.min(max, Math.max(min, sensor.value));
  const reported = spike ? Math.min(max, sensor.value + step * 12) : sensor.value;
  return Math.round(reported * 100) / 100;
}

function realisticValues(spike) {
  const { values } = farm.step(new Date());
  return Object.fromEntries(
    sensors.map((sensor) => {
      const value = values[sensor.type];
      return [sensor.sensorId, spike ? farm.spike(sensor.type, value) : value];
    }),
  );
}

function publish() {
  sent += 1;
  const spike = spikeEvery > 0 && sent % spikeEvery === 0;
  const modelled = mode === 'realistic' ? realisticValues(spike) : null;
  const payload = {
    apiKey,
    deviceId,
    timestamp: new Date().toISOString(),
    readings: sensors.map((sensor) => ({
      sensorId: sensor.sensorId,
      type: sensor.type,
      unit: sensor.unit,
      value: modelled ? modelled[sensor.sensorId] : nextValue(sensor, spike),
    })),
  };

  client.publish(`sf/devices/${deviceId}/sensors`, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error(`Publish failed: ${err.message}`);
      return;
    }
    const values = payload.readings.map((r) => `${r.type}=${r.value}`).join(' ');
    console.log(`[${sent}/${count > 0 ? count : '∞'}]${spike ? ' SPIKE' : ''} ${values}`);
  });

  if (count > 0 && sent >= count) {
    clearInterval(timer);
    setTimeout(() => client.end(), 1000);
  }
}

let timer;

client.on('connect', () => {
  console.log(`Connected to ${brokerUrl} | mode=${mode} | ${count > 0 ? count : 'unlimited'} messages every ${intervalMs} ms`);
  client.publish(
    `sf/devices/${deviceId}/status`,
    JSON.stringify({ apiKey, deviceId, status: 'ONLINE' }),
    { qos: 1 },
  );
  publish();
  timer = setInterval(publish, intervalMs);
  if (closedLoop && mode === 'realistic') {
    pollActuators();
    setInterval(pollActuators, pollMs);
  }
});

client.on('error', (err) => {
  console.error(`MQTT error: ${err.message}`);
  process.exit(1);
});
