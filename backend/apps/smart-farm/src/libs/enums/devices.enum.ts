import { registerEnumType } from '@nestjs/graphql';

export enum DeviceType {
  CONTROLLER = 'CONTROLLER',
  CAMERA = 'CAMERA',
  SENSOR_HUB = 'SENSOR_HUB',
}
registerEnumType(DeviceType, {
  name: 'DeviceType',
  description: 'Types of devices used in the smart farm system',
});

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}
registerEnumType(DeviceStatus, {
  name: 'DeviceStatus',
  description: 'Operational status of a device',
});
