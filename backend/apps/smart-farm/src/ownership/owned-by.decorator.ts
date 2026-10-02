import { SetMetadata } from '@nestjs/common';

export type OwnedResource =
  | 'farm'
  | 'greenhouse'
  | 'section'
  | 'device'
  | 'sensor'
  | 'camera'
  | 'actuator'
  | 'automationRule'
  | 'task'
  | 'anomaly';

export const OWNED_BY_KEY = 'ownership:idResource';

export const OwnedBy = (resource: OwnedResource) =>
  SetMetadata(OWNED_BY_KEY, resource);
