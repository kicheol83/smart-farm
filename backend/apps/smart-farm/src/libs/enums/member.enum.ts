import { registerEnumType } from '@nestjs/graphql';

export enum MemberRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
}
registerEnumType(MemberRole, {
  name: 'MemberRole',
  description: 'Roles assigned to members within the smart farm system',
});

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
registerEnumType(MemberStatus, {
  name: 'MemberStatus',
  description: 'Status of a member account',
});
