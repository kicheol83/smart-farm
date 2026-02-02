import { registerEnumType } from '@nestjs/graphql';

export enum AlertsActualValues {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
registerEnumType(AlertsActualValues, {
  name: 'AlertsActualValues',
  description: 'Actual values for alerts in the smart farm system',
});

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}
registerEnumType(AlertSeverity, {
  name: 'AlertSeverity',
  description: 'Severity levels for alerts in the smart farm system',
});
