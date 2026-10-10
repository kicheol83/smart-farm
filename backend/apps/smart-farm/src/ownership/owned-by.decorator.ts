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
  | 'anomaly'
  | 'field'
  | 'fieldMap'
  | 'sector'
  | 'alert'
  | 'command';

export const OWNED_BY_KEY = 'ownership:idResource';
export const OWNED_ARGS_KEY = 'ownership:argResources';

export const OwnedBy = (resource: OwnedResource) =>
  SetMetadata(OWNED_BY_KEY, resource);

export const OwnedArgs = (paths: Record<string, OwnedResource>) =>
  SetMetadata(OWNED_ARGS_KEY, paths);
