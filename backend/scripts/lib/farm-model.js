const UNITS = {
  TEMPERATURE: '°C',
  HUMIDITY: '%',
  SOIL_MOISTURE: '%',
  LIGHT: 'lux',
  PH: 'pH',
  CO2: 'ppm',
  WATER_LEVEL: '%',
  WATER_EC: 'mS/cm',
  RAIN: 'mm',
};

const OPTIMAL = {
  TEMPERATURE: [18, 28],
  HUMIDITY: [50, 80],
  SOIL_MOISTURE: [35, 70],
  PH: [5.8, 7.0],
  CO2: [400, 1000],
  WATER_EC: [1.2, 2.5],
};

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

class FarmModel {
  constructor({ seed = Date.now(), utcOffsetHours = 9 } = {}) {
    this.random = createRandom(seed);
    this.utcOffsetHours = utcOffsetHours;
    this.soilMoisture = 55;
    this.waterLevel = 85;
    this.ec = 1.9;
    this.lastTime = null;
    this.dayKey = null;
    this.cloudiness = 0.2;
    this.rainyDay = false;
    this.irrigations = [];
  }

  noise(scale) {
    return (this.random() + this.random() + this.random() - 1.5) * scale;
  }

  localHour(date) {
    const shifted = new Date(date.getTime() + this.utcOffsetHours * 3600000);
    return shifted.getUTCHours() + shifted.getUTCMinutes() / 60;
  }

  localDayIndex(date) {
    return Math.floor((date.getTime() + this.utcOffsetHours * 3600000) / 86400000);
  }

  startDay(date) {
    const key = this.localDayIndex(date);
    if (key === this.dayKey) return;
    this.dayKey = key;
    this.cloudiness = clamp(this.random() * 0.8, 0, 0.8);
    this.rainyDay = this.random() < 0.18;
  }

  step(date) {
    this.startDay(date);
    const hour = this.localHour(date);
    const day = this.localDayIndex(date);
    const minutes = this.lastTime === null ? 0 : (date.getTime() - this.lastTime) / 60000;
    this.lastTime = date.getTime();

    const daylight = Math.max(0, Math.sin((Math.PI * (hour - 6)) / 13));
    const seasonal = 1.5 * Math.sin(day / 9);
    const temperature = clamp(
      22.5 + seasonal + 5.5 * Math.sin((2 * Math.PI * (hour - 9)) / 24) - this.cloudiness * 2.5 + this.noise(0.5),
      8,
      40,
    );
    const humidity = clamp(
      71 - 1.9 * (temperature - 22.5) + (this.rainyDay ? 10 : 0) + this.noise(2),
      30,
      98,
    );
    const light = daylight > 0
      ? Math.max(0, daylight * 38000 * (1 - this.cloudiness * 0.7) + this.noise(1200))
      : Math.max(0, this.noise(8));
    const co2 = clamp(470 + 300 * (1 - daylight) + this.noise(18), 380, 1400);
    const ph = clamp(6.4 + 0.18 * Math.sin(day * 0.7) + this.noise(0.04), 5.2, 7.8);

    const dryingPerHour = 0.35 + Math.max(0, temperature - 20) * 0.05 + daylight * 0.35;
    this.soilMoisture -= (dryingPerHour * minutes) / 60;
    if (this.rainyDay && daylight > 0) {
      this.soilMoisture += (0.4 * minutes) / 60;
    }

    let irrigated = null;
    if (this.soilMoisture < 34) {
      const liters = round(140 + this.random() * 60, 1);
      this.soilMoisture += 20 + this.random() * 6;
      this.waterLevel -= 3 + this.random() * 1.5;
      this.ec -= 0.05;
      irrigated = { at: new Date(date), liters };
      this.irrigations.push(irrigated);
    }
    this.soilMoisture = clamp(this.soilMoisture, 15, 90);

    if (this.waterLevel < 25) {
      this.waterLevel = 92;
      this.ec = 2.1;
    }
    this.ec = clamp(this.ec + (0.004 * minutes) / 60, 1.3, 2.6);

    const values = {
      TEMPERATURE: round(temperature, 2),
      HUMIDITY: round(humidity, 2),
      SOIL_MOISTURE: round(this.soilMoisture + this.noise(0.4), 2),
      LIGHT: round(light, 0),
      PH: round(ph, 2),
      CO2: round(co2, 0),
      WATER_LEVEL: round(clamp(this.waterLevel + this.noise(0.3), 0, 100), 2),
      WATER_EC: round(this.ec + this.noise(0.03), 2),
      RAIN: this.rainyDay && hour > 12 && hour < 17 ? round(Math.max(0, 1.5 + this.noise(1)), 2) : 0,
    };

    return { values, irrigated };
  }

  spike(type, value) {
    const bump = {
      TEMPERATURE: 9,
      HUMIDITY: 22,
      SOIL_MOISTURE: 25,
      LIGHT: 25000,
      PH: 1.2,
      CO2: 600,
      WATER_LEVEL: -30,
      WATER_EC: 1.1,
      RAIN: 12,
    }[type];
    return bump === undefined ? value : round(value + bump, 2);
  }
}

function healthIndex(samplesByType) {
  const scores = Object.entries(OPTIMAL)
    .filter(([type]) => Array.isArray(samplesByType[type]) && samplesByType[type].length > 0)
    .map(([type, [min, max]]) => {
      const samples = samplesByType[type];
      const inRange = samples.filter((value) => value >= min && value <= max).length;
      return (inRange / samples.length) * 100;
    });
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

module.exports = { FarmModel, UNITS, OPTIMAL, healthIndex };
