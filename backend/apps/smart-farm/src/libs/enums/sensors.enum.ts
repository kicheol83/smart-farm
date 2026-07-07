import { registerEnumType } from '@nestjs/graphql';

export enum CameraStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}
registerEnumType(CameraStatus, {
  name: 'CameraStatus',
  description: 'Status of the camera device',
});

export enum SensorsType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  PH = 'PH',
  LIGHT = 'LIGHT',
  CO2 = 'CO2',
  SOIL_MOISTURE = 'SOIL_MOISTURE',
  WATER_LEVEL = 'WATER_LEVEL',
}

registerEnumType(SensorsType, {
  name: 'SensorsType',
  description: 'Sensor turlari',
  valuesMap: {
    TEMPERATURE: { description: 'Harorat (°C)' },
    HUMIDITY: { description: 'Namlik (%)' },
    PH: { description: 'pH qiymati' },
    LIGHT: { description: "Yorug'lik (lux)" },
    CO2: { description: 'CO2 (ppm)' },
    SOIL_MOISTURE: { description: 'Tuproq namligi (%)' },
    WATER_LEVEL: { description: 'Suv tanki darajasi (%)' },
  },
});
