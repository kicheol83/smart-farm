const mongoose = require('mongoose');

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
const threshold = Number(process.env.SOIL_THRESHOLD || 35);
const durationMinutes = Number(process.env.PUMP_MINUTES || 5);

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const now = new Date();

  const device = await db.collection('devices').findOne({ _id: deviceId });
  if (!device) throw new Error('Device not found.');

  let pump = await db.collection('actuators').findOne({ deviceId, actuatorType: 'WATER_PUMP' });
  if (!pump) {
    const result = await db.collection('actuators').insertOne({
      actuatorName: 'Irrigation Pump',
      actuatorType: 'WATER_PUMP',
      actuatorStatus: 'OFF',
      speedPercent: 100,
      deviceId,
      greenHouseId: device.greenHouseId,
      sectionId: device.sectionId,
      autoModeEnabled: true,
      createdAt: now,
      updatedAt: now,
    });
    pump = { _id: result.insertedId };
    console.log(`Created actuator: Irrigation Pump (${result.insertedId})`);
  } else {
    console.log(`Using existing actuator: ${pump.actuatorName} (${pump._id})`);
  }

  const existingRule = await db.collection('automationRules').findOne({
    actuatorId: pump._id,
    triggerSensorType: 'SOIL_MOISTURE',
  });
  if (!existingRule) {
    await db.collection('automationRules').insertOne({
      ruleName: 'Auto irrigation',
      actuatorId: pump._id,
      triggerSensorType: 'SOIL_MOISTURE',
      triggerCondition: 'BELOW',
      triggerThreshold: threshold,
      greenHouseId: device.greenHouseId,
      sectionId: device.sectionId,
      actionDurationMinutes: durationMinutes,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created rule: SOIL_MOISTURE BELOW ${threshold} → pump ON for ${durationMinutes} min`);
  } else {
    console.log(`Using existing rule: ${existingRule.ruleName}`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
