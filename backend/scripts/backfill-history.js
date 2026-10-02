const mongoose = require('mongoose');
const { FarmModel, healthIndex } = require('./lib/farm-model');

const SOURCE = 'backfill';

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const mongoUri = required('MONGO_URI');
const deviceId = new mongoose.Types.ObjectId(required('DEVICE_ID'));
const days = Number(process.env.DAYS || 30);
const stepMinutes = Number(process.env.STEP_MINUTES || 10);
const utcOffsetHours = Number(process.env.UTC_OFFSET_HOURS || 9);
const reset = process.env.RESET === 'true';

async function insertInBatches(collection, docs, size = 2000) {
  for (let i = 0; i < docs.length; i += size) {
    await collection.insertMany(docs.slice(i, i + size), { ordered: false });
  }
}

function summarize(values) {
  const count = values.length;
  const avg = values.reduce((sum, v) => sum + v, 0) / count;
  return {
    avgValue: Math.round(avg * 100) / 100,
    minValue: Math.min(...values),
    maxValue: Math.max(...values),
    count,
  };
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const device = await db.collection('devices').findOne({ _id: deviceId });
  if (!device) throw new Error('Device not found.');

  const sensors = await db.collection('sensors').find({ deviceId }).toArray();
  if (sensors.length === 0) throw new Error('This device has no sensors.');

  const sensorIds = sensors.map((s) => s._id);
  const now = new Date();
  const from = new Date(now.getTime() - days * 86400000);
  from.setUTCMinutes(0, 0, 0);

  if (reset) {
    const removed = await Promise.all([
      db.collection('sensor_data').deleteMany({ sensorId: { $in: sensorIds }, source: SOURCE }),
      db.collection('timeSeriesSensorData').deleteMany({ 'metadata.sensorId': { $in: sensorIds }, 'metadata.source': SOURCE }),
      db.collection('aggregatedSensorData').deleteMany({ sensorId: { $in: sensorIds }, source: SOURCE }),
      db.collection('waterUsages').deleteMany({ greenHouseId: device.greenHouseId, source: SOURCE }),
      db.collection('reportEntries').deleteMany({ greenHouseId: device.greenHouseId, source: SOURCE }),
      db.collection('plantHealth').deleteMany({ source: SOURCE, fieldsId: { $in: (await db.collection('sections').find({ greenHouseId: device.greenHouseId }).toArray()).map((x) => x._id) } }),
    ]);
    console.log(`Removed previous backfill: ${removed.map((r) => r.deletedCount).join(', ')}`);
  }

  const model = new FarmModel({ seed: deviceId.getTimestamp().getTime(), utcOffsetHours });
  const rawDocs = [];
  const tsDocs = [];
  const hourly = new Map();
  const daily = new Map();
  const dailyByType = new Map();
  const waterDocs = [];

  for (let t = from.getTime(); t <= now.getTime(); t += stepMinutes * 60000) {
    const at = new Date(t);
    const { values, irrigated } = model.step(at);

    for (const sensor of sensors) {
      const value = values[sensor.sensorType];
      if (value === undefined) continue;

      rawDocs.push({
        sensorId: sensor._id,
        sensorDataName: sensor.sensorType,
        sensorDataValue: value,
        recordedAt: at,
        createdAt: at,
        updatedAt: at,
        source: SOURCE,
      });
      tsDocs.push({
        timestamp: at,
        metadata: {
          sensorId: sensor._id,
          sensorType: sensor.sensorType,
          deviceId,
          unit: sensor.sensorsUnit || 'unit',
          source: SOURCE,
        },
        value,
      });

      const hourStart = new Date(t - (t % 3600000));
      const hourKey = `${sensor._id}:${hourStart.getTime()}`;
      if (!hourly.has(hourKey)) hourly.set(hourKey, { sensor, start: hourStart, values: [] });
      hourly.get(hourKey).values.push(value);

      const dayStart = new Date(t - (t % 86400000));
      const dayKey = `${sensor._id}:${dayStart.getTime()}`;
      if (!daily.has(dayKey)) daily.set(dayKey, { sensor, start: dayStart, values: [] });
      daily.get(dayKey).values.push(value);

      const typeKey = `${dayStart.getTime()}:${sensor.sensorType}`;
      if (!dailyByType.has(typeKey)) dailyByType.set(typeKey, []);
      dailyByType.get(typeKey).push(value);
    }

    if (irrigated) {
      waterDocs.push({
        greenHouseId: device.greenHouseId,
        sectionId: device.sectionId,
        waterAmount: irrigated.liters,
        durationMinutes: Math.round(irrigated.liters / 12),
        recordedAt: irrigated.at,
        createdAt: irrigated.at,
        updatedAt: irrigated.at,
        source: SOURCE,
      });
    }
  }

  const aggregateDocs = [];
  for (const [period, map, length] of [['HOURLY', hourly, 3600000], ['DAILY', daily, 86400000]]) {
    for (const { sensor, start, values } of map.values()) {
      aggregateDocs.push({
        sensorId: sensor._id,
        sensorType: sensor.sensorType,
        period,
        periodStart: start,
        periodEnd: new Date(start.getTime() + length),
        ...summarize(values),
        createdAt: start,
        updatedAt: start,
        source: SOURCE,
      });
    }
  }

  await insertInBatches(db.collection('sensor_data'), rawDocs);
  await insertInBatches(db.collection('timeSeriesSensorData'), tsDocs);
  await insertInBatches(db.collection('aggregatedSensorData'), aggregateDocs);

  if (waterDocs.length > 0) {
    await insertInBatches(db.collection('waterUsages'), waterDocs);
  }

  for (const sensor of sensors) {
    const values = rawDocs.filter((d) => String(d.sensorId) === String(sensor._id)).map((d) => d.sensorDataValue);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
    await db.collection('sensorStats').updateOne(
      { sensorId: sensor._id },
      { $set: { mean, std, sampleSize: values.length, updatedAt: now } },
      { upsert: true },
    );
  }

  const sections = await db.collection('sections').find({ greenHouseId: device.greenHouseId }).toArray();
  const entryDocs = [];
  const healthDocs = [];
  let latestHealth = null;
  const dayStarts = [...new Set([...daily.values()].map((d) => d.start.getTime()))].sort();
  for (const dayStart of dayStarts.slice(0, -1)) {
    const samples = {};
    const averages = {};
    for (const type of ['TEMPERATURE', 'HUMIDITY', 'SOIL_MOISTURE', 'PH', 'CO2', 'WATER_EC']) {
      const values = dailyByType.get(`${dayStart}:${type}`);
      if (values) {
        samples[type] = values;
        averages[type] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    }
    const health = healthIndex(samples);
    latestHealth = health;
    for (const section of sections) {
      healthDocs.push({
        plantHealthIndex: health,
        plantValue: averages.SOIL_MOISTURE !== undefined ? Math.round(averages.SOIL_MOISTURE * 10) / 10 : health,
        recordeAt: new Date(dayStart + 12 * 3600000),
        fieldsId: section._id,
        source: SOURCE,
      });
      const entryDate = new Date(dayStart + 12 * 3600000);
      entryDocs.push({
        entryDate,
        greenHouseId: section.greenHouseId,
        sectionId: section._id,
        sectionName: section.sectionName,
        areaM2: section.sectionArea,
        healthIndex: health,
        status: health >= 90 ? 'DONE' : health >= 70 ? 'OPTIMAL' : 'ATTENTION',
        soilMoisture: averages.SOIL_MOISTURE !== undefined ? Math.round(averages.SOIL_MOISTURE * 10) / 10 : undefined,
        humidity: averages.HUMIDITY !== undefined ? Math.round(averages.HUMIDITY * 10) / 10 : undefined,
        pestDisease: 'No pest',
        createdAt: entryDate,
        updatedAt: entryDate,
        source: SOURCE,
      });
    }
  }
  if (entryDocs.length > 0) {
    await insertInBatches(db.collection('reportEntries'), entryDocs);
  }
  if (healthDocs.length > 0) {
    await insertInBatches(db.collection('plantHealth'), healthDocs);
  }
  if (latestHealth !== null && sections.length > 0) {
    const status = latestHealth >= 80 ? 'HEALTHY' : latestHealth >= 50 ? 'WARNING' : 'CRITICAL';
    await db.collection('sections').updateMany(
      { _id: { $in: sections.map((section) => section._id) } },
      { $set: { currentHealthIndex: latestHealth, sectionStatus: status } },
    );
  }

  console.log(`Device: ${device.deviceName} | ${days} days, every ${stepMinutes} min`);
  console.log(`sensor_data:          +${rawDocs.length}`);
  console.log(`timeSeriesSensorData: +${tsDocs.length}`);
  console.log(`aggregatedSensorData: +${aggregateDocs.length}`);
  console.log(`waterUsages:          +${waterDocs.length}`);
  console.log(`reportEntries:        +${entryDocs.length}`);
  console.log(`plantHealth:          +${healthDocs.length}`);
  console.log(`sensorStats:          ${sensors.length} updated`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
