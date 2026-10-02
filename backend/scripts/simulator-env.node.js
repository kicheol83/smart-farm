const mongoose = require('mongoose');

const SUPPORTED = ['TEMPERATURE', 'HUMIDITY', 'SOIL_MOISTURE', 'LIGHT', 'PH', 'CO2', 'WATER_LEVEL', 'WATER_EC', 'RAIN'];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Set MONGO_URI first.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const devices = await db.collection('devices').find({}, { projection: { deviceName: 1 } }).toArray();
  if (devices.length === 0) {
    console.log('No devices found in this database.');
  }

  for (const device of devices) {
    const key = await db.collection('deviceApiKeys').findOne({ deviceId: device._id, isActive: true });
    const sensors = (await db.collection('sensors').find({ deviceId: device._id }).toArray()).filter((sensor) =>
      SUPPORTED.includes(sensor.sensorType),
    );

    console.log('');
    console.log(`==== ${device.deviceName} ====`);
    console.log(`$env:DEVICE_ID = "${device._id.toHexString()}"`);
    console.log(
      key
        ? `$env:API_KEY = "${key.apiKey}"`
        : 'API_KEY: no active key for this device, generate one with the generateDeviceApiKey mutation',
    );
    console.log(
      sensors.length > 0
        ? `$env:SENSORS = "${sensors.map((s) => `${s._id.toHexString()}:${s.sensorType}:${s.sensorsUnit || 'unit'}`).join(',')}"`
        : 'SENSORS: this device has no sensors yet',
    );
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
