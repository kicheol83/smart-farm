const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const path = require('path');

const TAG = 'demo';
const mongoUri = process.env.MONGO_URI || process.env.MONGO_PROD;
const memberEmail = (process.env.MEMBER_EMAIL || '').toLowerCase();
const reset = process.env.RESET === 'true';
const historyDays = Number(process.env.DAYS || 30);

if (!mongoUri || !memberEmail) {
  console.error('MONGO_URI (or MONGO_PROD) and MEMBER_EMAIL are required.');
  process.exit(1);
}

const { ObjectId } = mongoose.Types;
const HOUR = 3600000;
const DAY = 24 * HOUR;
const now = Date.now();
const at = (offsetMs) => new Date(now + offsetMs);

const SENSORS = [
  ['TEMPERATURE', '°C'],
  ['HUMIDITY', '%'],
  ['SOIL_MOISTURE', '%'],
  ['LIGHT', 'lux'],
  ['PH', 'pH'],
  ['CO2', 'ppm'],
  ['WATER_LEVEL', '%'],
  ['WATER_EC', 'mS/cm'],
];

const CROPS = [
  ['Tomato', 24, 60],
  ['Bell Pepper', 25, 55],
  ['Strawberry', 20, 65],
  ['Lettuce', 18, 70],
  ['Spinach', 17, 65],
  ['Cucumber', 26, 70],
];

const GREENHOUSES = [
  {
    name: 'Greenhouse A · Fruiting Crops',
    type: 'Glass',
    size: 1200,
    lat: 36.6424,
    lng: 127.489,
    sections: [
      { name: 'Tomato Zone A', type: 'SOIL', area: 320, plants: 640, crop: 'Tomato', x: 22, y: 30 },
      { name: 'Tomato Zone B', type: 'SOIL', area: 280, plants: 560, crop: 'Tomato', x: 55, y: 30 },
      { name: 'Bell Pepper Rows', type: 'SOIL', area: 240, plants: 420, crop: 'Bell Pepper', x: 22, y: 68 },
      { name: 'Cucumber Trellis', type: 'HYDROPONIC', area: 200, plants: 300, crop: 'Cucumber', x: 55, y: 68 },
    ],
  },
  {
    name: 'Greenhouse B · Leafy Greens & Berries',
    type: 'Polycarbonate',
    size: 800,
    lat: 36.6431,
    lng: 127.4903,
    sections: [
      { name: 'Strawberry Beds', type: 'NFT', area: 260, plants: 900, crop: 'Strawberry', x: 25, y: 40 },
      { name: 'Lettuce NFT Channels', type: 'NFT', area: 220, plants: 1400, crop: 'Lettuce', x: 60, y: 40 },
      { name: 'Spinach Hydroponics', type: 'HYDROPONIC', area: 180, plants: 1100, crop: 'Spinach', x: 42, y: 75 },
    ],
  },
];

const WORKERS = [
  ['Kim Minjun', 'minjun.kim'],
  ['Lee Seoyeon', 'seoyeon.lee'],
  ['Park Jihoon', 'jihoon.park'],
];

function stamp(doc, created = new Date(now)) {
  return { ...doc, seed: TAG, createdAt: created, updatedAt: created };
}

async function removePrevious(db, memberId) {
  const farms = await db.collection('farms').find({ memberId, seed: TAG }).toArray();
  const farmIds = farms.map((f) => f._id);
  const greenhouses = await db.collection('greenHouses').find({ farmsId: { $in: farmIds } }).toArray();
  const ghIds = greenhouses.map((g) => g._id);
  const devices = await db.collection('devices').find({ greenHouseId: { $in: ghIds } }).toArray();
  const deviceIds = devices.map((d) => d._id);
  const sensors = await db.collection('sensors').find({ deviceId: { $in: deviceIds } }).toArray();
  const sensorIds = sensors.map((s) => s._id);
  const sections = await db.collection('sections').find({ greenHouseId: { $in: ghIds } }).toArray();
  const sectionIds = sections.map((s) => s._id);
  const tasks = await db.collection('tasks').find({ greenHousesId: { $in: ghIds } }).toArray();

  await Promise.all([
    db.collection('sensor_data').deleteMany({ sensorId: { $in: sensorIds } }),
    db.collection('timeSeriesSensorData').deleteMany({ 'metadata.sensorId': { $in: sensorIds } }),
    db.collection('aggregatedSensorData').deleteMany({ sensorId: { $in: sensorIds } }),
    db.collection('sensorStats').deleteMany({ sensorId: { $in: sensorIds } }),
    db.collection('anomalyLogs').deleteMany({ greenHouseId: { $in: ghIds } }),
    db.collection('alerts').deleteMany({ $or: [{ deviceId: { $in: deviceIds } }, { sectionId: { $in: sectionIds } }] }),
    db.collection('waterUsages').deleteMany({ greenHouseId: { $in: ghIds } }),
    db.collection('reportEntries').deleteMany({ greenHouseId: { $in: ghIds } }),
    db.collection('plantHealth').deleteMany({ fieldsId: { $in: sectionIds } }),
    db.collection('taskAssignments').deleteMany({ taskId: { $in: tasks.map((t) => t._id) } }),
    db.collection('tasks').deleteMany({ greenHousesId: { $in: ghIds } }),
    db.collection('automationRules').deleteMany({ greenHouseId: { $in: ghIds } }),
    db.collection('actuators').deleteMany({ greenHouseId: { $in: ghIds } }),
    db.collection('deviceApiKeys').deleteMany({ deviceId: { $in: deviceIds } }),
    db.collection('sensors').deleteMany({ deviceId: { $in: deviceIds } }),
    db.collection('devices').deleteMany({ greenHouseId: { $in: ghIds } }),
    db.collection('sections').deleteMany({ greenHouseId: { $in: ghIds } }),
    db.collection('greenHouses').deleteMany({ farmsId: { $in: farmIds } }),
    db.collection('farms').deleteMany({ memberId, seed: TAG }),
    db.collection('actionLogs').deleteMany({ memberId, seed: TAG }),
    db.collection('members').deleteMany({ seed: TAG }),
  ]);
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const owner = await db.collection('members').findOne({ memberEmail });
  if (!owner) throw new Error(`Member not found: ${memberEmail}`);

  const existing = await db.collection('farms').findOne({ memberId: owner._id, seed: TAG });
  if (existing && !reset) {
    throw new Error('Demo data already exists for this member. Run with RESET=true to recreate it.');
  }
  if (reset) await removePrevious(db, owner._id);

  const cropIds = {};
  for (const [name, temp, moisture] of CROPS) {
    const found = await db.collection('crops').findOne({ cropsName: name });
    if (found) {
      cropIds[name] = found._id;
    } else {
      const { insertedId } = await db.collection('crops').insertOne(
        stamp({ cropsName: name, cropsOptionalTemps: temp, cropsOptionalMoistures: moisture }),
      );
      cropIds[name] = insertedId;
    }
  }

  const workerPassword = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
  const workerIds = [];
  for (const [fullName, handle] of WORKERS) {
    const { insertedId } = await db.collection('members').insertOne(
      stamp(
        {
          memberFullName: fullName,
          memberEmail: `${handle}@demo.javohir.dev`,
          memberPassword: workerPassword,
          memberRole: 'WORKER',
          memberStatus: 'ACTIVE',
          memberAvatar: '',
        },
        at(-60 * DAY + workerIds.length * 9 * DAY),
      ),
    );
    workerIds.push(insertedId);
  }

  const { insertedId: farmId } = await db.collection('farms').insertOne(
    stamp(
      {
        farmName: 'Cheongju Smart Farm',
        farmLocation: 'Cheongju-si, Chungcheongbuk-do, Korea',
        farmDescription: 'Two-greenhouse demo farm monitored by ESP32 sensor hubs over MQTT.',
        memberId: owner._id,
      },
      at(-90 * DAY),
    ),
  );

  const summary = [];
  const hubs = [];

  for (const [ghIndex, gh] of GREENHOUSES.entries()) {
    const { insertedId: ghId } = await db.collection('greenHouses').insertOne(
      stamp({ greenHouseName: gh.name, greenHouseType: gh.type, greenHouseSize: gh.size, farmsId: farmId }, at(-88 * DAY)),
    );

    const sectionIds = [];
    for (const section of gh.sections) {
      const { insertedId } = await db.collection('sections').insertOne(
        stamp(
          {
            sectionName: section.name,
            sectionType: section.type,
            sectionStatus: 'HEALTHY',
            sectionArea: section.area,
            plantCount: section.plants,
            currentHealthIndex: null,
            greenHouseId: ghId,
            cropsId: cropIds[section.crop],
            mapPositionX: section.x,
            mapPositionY: section.y,
          },
          at(-85 * DAY),
        ),
      );
      sectionIds.push(insertedId);
    }

    const device = (name, type, status, sectionIndex, extra = {}) => ({
      deviceName: name,
      deviceType: type,
      deviceStatus: status,
      installedAt: at(-80 * DAY),
      greenHouseId: ghId,
      sectionId: sectionIndex === null ? undefined : sectionIds[sectionIndex],
      networkType: 'WIFI',
      powerSource: 'AC',
      rssi: -58 - ghIndex * 6,
      snr: 24,
      lastDataReceived: new Date(now),
      latitude: gh.lat,
      longitude: gh.lng,
      ...extra,
    });

    const letter = ghIndex === 0 ? 'A' : 'B';
    const devicesToInsert = [
      device(`ESP32 Sensor Hub ${letter}1`, 'SENSOR_HUB', 'ONLINE', 0),
      device(`ESP32 Relay Controller ${letter}`, 'CONTROLLER', 'ONLINE', null),
      device(`LoRa Gateway ${letter}`, 'GATEWAY', 'ONLINE', null, { networkType: 'ETHERNET' }),
      device(`ESP32 Sensor Hub ${letter}2`, 'SENSOR_HUB', ghIndex === 0 ? 'OFFLINE' : 'MAINTENANCE', 1, {
        rssi: -92,
        snr: 6,
        lastDataReceived: at(-6 * HOUR),
        powerSource: 'BATTERY',
      }),
    ];
    if (ghIndex === 0) {
      devicesToInsert.push(device('Rooftop Weather Station', 'WEATHER_STATION', 'ONLINE', null, { powerSource: 'SOLAR' }));
    }
    const deviceDocs = devicesToInsert.map((d) => stamp(d, at(-80 * DAY)));
    const { insertedIds } = await db.collection('devices').insertMany(deviceDocs);
    const deviceIds = Object.values(insertedIds);
    const hubId = deviceIds[0];
    const controllerId = deviceIds[1];

    const sensorDocs = SENSORS.map(([type, unit]) => stamp({ sensorType: type, sensorsUnit: unit, deviceId: hubId }, at(-80 * DAY)));
    const { insertedIds: sensorInserted } = await db.collection('sensors').insertMany(sensorDocs);
    const sensorIds = Object.values(sensorInserted);
    const secondHubSensors = SENSORS.slice(0, 3).map(([type, unit]) =>
      stamp({ sensorType: type, sensorsUnit: unit, deviceId: deviceIds[3] }, at(-80 * DAY)),
    );
    await db.collection('sensors').insertMany(secondHubSensors);

    const apiKey = `sf_${crypto.randomBytes(16).toString('hex')}`;
    await db.collection('deviceApiKeys').insertOne(stamp({ apiKey, deviceId: hubId, isActive: true }, at(-80 * DAY)));

    const actuator = (name, type, sectionIndex, extra = {}) =>
      stamp(
        {
          actuatorName: name,
          actuatorType: type,
          actuatorStatus: 'OFF',
          speedPercent: 100,
          deviceId: controllerId,
          greenHouseId: ghId,
          sectionId: sectionIndex === null ? undefined : sectionIds[sectionIndex],
          autoModeEnabled: true,
          lastToggledAt: at(-3 * HOUR - ghIndex * HOUR),
          ...extra,
        },
        at(-75 * DAY),
      );
    const actuatorDocs = [
      actuator('Main Irrigation Pump', 'WATER_PUMP', null, { deviceId: hubId }),
      ...gh.sections.map((s, i) => actuator(`${s.name} Valve`, 'SOLENOID_VALVE', i)),
      actuator('LED Grow Lights', 'GROW_LIGHT', null),
      actuator('Exhaust Fan', 'COOLING_FAN', null, { speedPercent: 70 }),
    ];
    const { insertedIds: actuatorInserted } = await db.collection('actuators').insertMany(actuatorDocs);
    const actuatorIds = Object.values(actuatorInserted);
    const pumpId = actuatorIds[0];
    const lightId = actuatorIds[actuatorIds.length - 2];
    const fanId = actuatorIds[actuatorIds.length - 1];

    const rule = (name, actuatorId, sensorType, condition, threshold, minutes, triggeredAgo) =>
      stamp(
        {
          ruleName: name,
          actuatorId,
          triggerSensorType: sensorType,
          triggerCondition: condition,
          triggerThreshold: threshold,
          greenHouseId: ghId,
          actionDurationMinutes: minutes,
          enabled: true,
          lastTriggeredAt: triggeredAgo === null ? undefined : at(-triggeredAgo),
        },
        at(-70 * DAY),
      );
    await db.collection('automationRules').insertMany([
      rule('Auto irrigation', pumpId, 'SOIL_MOISTURE', 'BELOW', 35, 5, 3 * HOUR),
      rule('Cool down on heat', fanId, 'TEMPERATURE', 'ABOVE', 30, 15, 26 * HOUR),
      rule('Ventilate on high humidity', fanId, 'HUMIDITY', 'ABOVE', 85, 10, 9 * HOUR),
      rule('Supplemental lighting', lightId, 'LIGHT', 'BELOW', 8000, 60, null),
    ]);

    const taskTemplates = [
      ['Inspect drip lines for clogs', 'Walk every row and flush clogged emitters.', 'DONE', 'MEDIUM', -2],
      ['Calibrate pH sensor', 'Two-point calibration with pH 4.0 and 7.0 buffers.', 'DONE', 'HIGH', -1],
      ['Prune lower leaves', 'Remove yellowing leaves below the first truss.', 'IN_PROGRESS', 'MEDIUM', 0],
      ['Refill nutrient tank', 'Mix A/B solution to EC 1.9 and top up the tank.', 'TODO', 'HIGH', 0],
      ['Replace hub battery', 'Sensor hub 2 is offline — swap the battery pack.', 'TODO', 'HIGH', 1],
      ['Scout for aphids', 'Check undersides of leaves with a hand lens.', 'IN_PROGRESS', 'LOW', 1],
      ['Harvest ripe produce', 'Harvest and weigh, log yield per section.', 'TODO', 'MEDIUM', 2],
      ['Clean fan filters', 'Remove dust from exhaust fan intake filters.', 'TODO', 'LOW', 4],
    ];
    const taskDocs = taskTemplates.map(([title, description, status, priority, dayOffset], i) =>
      stamp(
        {
          taskTitle: `${title} · ${letter}`,
          taskDescription: description,
          taskStatus: status,
          taskPriority: priority,
          dueDate: at(dayOffset * DAY + (i % 3) * HOUR),
          greenHousesId: ghId,
          sectionId: sectionIds[i % sectionIds.length],
          startTime: ['08:00', '09:30', '13:00', '15:30'][i % 4],
          endTime: ['09:00', '11:00', '14:30', '17:00'][i % 4],
        },
        at((dayOffset - 3) * DAY),
      ),
    );
    const { insertedIds: taskInserted } = await db.collection('tasks').insertMany(taskDocs);
    await db.collection('taskAssignments').insertMany(
      Object.values(taskInserted).map((taskId, i) => stamp({ memberId: workerIds[i % workerIds.length], taskId })),
    );

    const alertTemplates = [
      ['TEMPERATURE', 30, 'HIGH', 'WARNING', 0, 0.2],
      ['HUMIDITY', 85, 'HIGH', 'WARNING', 1, 0.6],
      ['SOIL_MOISTURE', 35, 'LOW', 'CRITICAL', 2, 1.1],
      ['LIGHT', 8000, 'LOW', 'INFO', 3, 1.9],
      ['SYSTEM_SENSOR', 0, 'LOW', 'CRITICAL', null, 0.3],
      ['PLANT_HEALTH', 50, 'LOW', 'WARNING', 2, 3.5],
      ['TEMPERATURE', 30, 'HIGH', 'INFO', 0, 5.2],
    ];
    await db.collection('alerts').insertMany(
      alertTemplates.map(([type, threshold, actual, severity, sensorIndex, daysAgo], i) =>
        stamp(
          {
            alertsType: type,
            alertsThreshold: threshold,
            alertsActualValues: actual,
            alertsSeverity: severity,
            sensorsId: sensorIndex === null ? undefined : sensorIds[sensorIndex],
            sectionId: sectionIds[i % sectionIds.length],
            deviceId: type === 'SYSTEM_SENSOR' ? deviceIds[3] : hubId,
          },
          at(-daysAgo * DAY),
        ),
      ),
    );

    hubs.push({ id: hubId, apiKey, sensorIds, name: gh.name });
    summary.push(`${gh.name}: ${gh.sections.length} sections, ${deviceDocs.length} devices, ${actuatorDocs.length} actuators`);
  }

  const logTemplates = [
    ['LOGIN', 'MEMBER', 'Signed in'],
    ['CREATE', 'FARM', 'Created farm Cheongju Smart Farm'],
    ['CREATE', 'GREENHOUSE', 'Created Greenhouse A · Fruiting Crops'],
    ['CREATE', 'GREENHOUSE', 'Created Greenhouse B · Leafy Greens & Berries'],
    ['CREATE', 'DEVICE', 'Registered ESP32 Sensor Hub A1'],
    ['UPDATE', 'SENSOR', 'Calibrated pH sensor'],
    ['UPDATE', 'SETTINGS', 'Changed notification preferences'],
    ['CREATE', 'TASK', 'Assigned task Refill nutrient tank'],
    ['EXPORT', 'REPORT', 'Exported weekly report'],
    ['UPDATE', 'ALERT', 'Acknowledged soil moisture alert'],
    ['LOGIN', 'MEMBER', 'Signed in'],
  ];
  await db.collection('actionLogs').insertMany(
    logTemplates.map(([actionType, actionResource, description], i) =>
      stamp(
        {
          actionType,
          actionResource,
          description,
          memberId: owner._id,
          memberFullName: owner.memberFullName,
          device: i % 2 === 0 ? 'Chrome · Windows' : 'Safari · iPhone',
          ipAddress: '203.0.113.' + (20 + i),
        },
        at(-(logTemplates.length - i) * 0.7 * DAY),
      ),
    ),
  );

  console.log('Demo farm created for', memberEmail);
  summary.forEach((line) => console.log(' -', line));

  await mongoose.disconnect();

  for (const hub of hubs) {
    console.log(`\nBackfilling ${historyDays} days of history for ${hub.name}...`);
    execFileSync(process.execPath, [path.join(__dirname, 'backfill-history.js')], {
      stdio: 'inherit',
      env: { ...process.env, MONGO_URI: mongoUri, DEVICE_ID: String(hub.id), DAYS: String(historyDays), RESET: 'true' },
    });
  }

  const sim = hubs[0];
  console.log('\nAdd these lines to /opt/apps/smart-farm/.env for the 24/7 simulator:');
  console.log(`SIM_DEVICE_ID=${sim.id}`);
  console.log(`SIM_API_KEY=${sim.apiKey}`);
  console.log(`SIM_SENSORS=${sim.sensorIds.map((id, i) => `${id}:${SENSORS[i][0]}:${SENSORS[i][1]}`).join(',')}`);
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
