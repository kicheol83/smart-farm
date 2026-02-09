import { registerEnumType } from '@nestjs/graphql';

export enum SensorsType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  SOIL_MOISTURE = 'SOIL_MOISTURE',
  LIGHT_INTENSITY = 'LIGHT_INTENSITY',
}
registerEnumType(SensorsType, {
  name: 'SensorsType',
  description: 'Types of sensors used in the smart farm system',
});

export enum CameraStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
}
registerEnumType(CameraStatus, {
  name: 'CameraStatus',
  description: 'Status of the camera device',
});
