import { registerEnumType } from '@nestjs/graphql';

export enum TemperatureUnit {
  CELSIUS = 'CELSIUS',
  FAHRENHEIT = 'FAHRENHEIT',
}
registerEnumType(TemperatureUnit, {
  name: 'TemperatureUnit',
  description: 'Units for measuring temperature',
});
