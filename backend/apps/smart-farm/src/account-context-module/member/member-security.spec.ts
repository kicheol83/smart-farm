import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { AuthService } from '../auth/auth.service';
import { Member } from '../../libs/dto/account-context-dto/member/member';
import { MessageBuffersResolver } from '../../mid-iot/message-buffers/message-buffers.resolver';
import { MessageBuffersService } from '../../mid-iot/message-buffers/message-buffers.service';
import { RoomManagerResolver } from '../../mid-iot/room-manager/room-manager.resolver';
import { RoomManagerService } from '../../mid-iot/room-manager/room-manager.service';

const MEMBER_ID = '64b7f0c2a1b2c3d4e5f60718';

const tokens: Record<string, { memberRole: string }> = {
  'worker-token': { memberRole: 'WORKER' },
  'manager-token': { memberRole: 'MANAGER' },
  'admin-token': { memberRole: 'ADMIN' },
};

const authService = {
  hashPassword: jest.fn(async (value: string) => `hashed:${value}`),
  createToken: jest.fn(async () => 'issued-token'),
  sendOtpAfterSignup: jest.fn(async () => undefined),
  verifyToken: jest.fn(async (token: string) => {
    const claims = tokens[token];
    if (!claims) throw new Error('invalid token');
    return { _id: MEMBER_ID, memberFullName: 'Test Member', ...claims };
  }),
};

const savedMember = (fields: Record<string, unknown>) => ({
  _id: MEMBER_ID,
  memberFullName: 'Test Member',
  memberEmail: 'member@example.com',
  memberRole: 'WORKER',
  memberStatus: 'ACTIVE',
  memberAvatar: '',
  ...fields,
});

const memberModel = {
  create: jest.fn(async (doc: Record<string, unknown>) => savedMember(doc)),
  findOneAndUpdate: jest.fn((_filter: unknown, update: { $set?: Record<string, unknown> }) => ({
    exec: async () => savedMember(update.$set ?? {}),
  })),
  aggregate: jest.fn(() => ({
    exec: async () => [{ list: [], metaCounter: [{ total: 0 }] }],
  })),
};

const bufferService = {
  getStats: jest.fn(async () => ({ pending: 0, deadLetter: 0 })),
  getDeadLetterMessages: jest.fn(async () => []),
  clearDeadLetter: jest.fn(async () => 0),
};

const roomManager = {
  getRoomStats: jest.fn(async () => ({})),
  getAllRoomStats: jest.fn(async () => []),
};

describe('member and operations access control', () => {
  let app: INestApplication;

  const gql = (query: string, token?: string) => {
    const call = request(app.getHttpServer()).post('/graphql').send({ query });
    return token ? call.set('Authorization', `Bearer ${token}`) : call;
  };

  const errorText = (body: { errors?: { message?: string }[] }) =>
    (body.errors ?? []).map((e) => e.message).join(' | ');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [
        MemberResolver,
        MemberService,
        MessageBuffersResolver,
        RoomManagerResolver,
        { provide: getModelToken(Member.name), useValue: memberModel },
        { provide: AuthService, useValue: authService },
        { provide: MessageBuffersService, useValue: bufferService },
        { provide: RoomManagerService, useValue: roomManager },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: false, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a sign-up that asks for a role', async () => {
    const res = await gql(
      'mutation { signup(input: { memberFullName: "Role Seeker", memberEmail: "seeker@example.com", memberPassword: "abc12345", memberRole: ADMIN }) { memberRole } }',
    );

    expect(res.body.data?.signup).toBeFalsy();
    expect(errorText(res.body)).toContain('memberRole');
    expect(memberModel.create).not.toHaveBeenCalled();
  });

  it('creates every new account with the default role', async () => {
    const res = await gql(
      'mutation { signup(input: { memberFullName: "New Member", memberEmail: "new@example.com", memberPassword: "abc12345" }) { memberRole } }',
    );

    expect(res.body.data.signup.memberRole).toBe('WORKER');
    const stored = memberModel.create.mock.calls[0][0];
    expect(Object.keys(stored).sort()).toEqual(
      ['memberAvatar', 'memberEmail', 'memberFullName', 'memberPassword'].sort(),
    );
    expect(stored.memberPassword).toBe('hashed:abc12345');
  });

  it.each([
    ['memberRole', '"ADMIN"'],
    ['memberStatus', '"ACTIVE"'],
    ['memberEmail', '"other@example.com"'],
    ['memberPassword', '"abc12345"'],
  ])('rejects a self update of %s', async (field, value) => {
    const res = await gql(
      `mutation { updateMember(input: { _id: "${MEMBER_ID}", ${field}: ${value} }) { memberRole } }`,
      'worker-token',
    );

    expect(res.body.data?.updateMember).toBeFalsy();
    expect(errorText(res.body)).toContain(field);
    expect(memberModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('lets a member change only their own name and avatar', async () => {
    const res = await gql(
      'mutation { updateMember(input: { memberFullName: "Renamed Member" }) { memberFullName memberRole } }',
      'worker-token',
    );

    expect(res.body.data.updateMember).toEqual({
      memberFullName: 'Renamed Member',
      memberRole: 'WORKER',
    });
    const [filter, update] = memberModel.findOneAndUpdate.mock.calls[0];
    expect(String((filter as { _id: unknown })._id)).toBe(MEMBER_ID);
    expect(update).toEqual({ $set: { memberFullName: 'Renamed Member' } });
  });

  it('does not list members to anonymous callers', async () => {
    const res = await gql(
      '{ getManagerMember(input: { page: 1, limit: 10, search: {} }) { list { memberEmail } } }',
    );

    expect(res.body.data?.getManagerMember).toBeFalsy();
    expect(memberModel.aggregate).not.toHaveBeenCalled();
  });

  it('does not list members to a worker', async () => {
    const res = await gql(
      '{ getManagerMember(input: { page: 1, limit: 10, search: {} }) { list { memberEmail } } }',
      'worker-token',
    );

    expect(res.body.data?.getManagerMember).toBeFalsy();
    expect(memberModel.aggregate).not.toHaveBeenCalled();
  });

  it.each([
    ['{ messageBufferStats { pending } }', bufferService.getStats],
    ['{ deadLetterMessages(limit: 1) { topic } }', bufferService.getDeadLetterMessages],
    ['mutation { clearDeadLetterQueue }', bufferService.clearDeadLetter],
  ])('keeps %s closed to anonymous callers and workers', async (query, handler) => {
    const anonymous = await gql(query);
    const worker = await gql(query, 'worker-token');
    const forged = await gql(query, 'forged-token');

    for (const res of [anonymous, worker, forged]) {
      expect(res.body.errors?.length).toBeGreaterThan(0);
    }
    expect(handler).not.toHaveBeenCalled();
  });

  it('still serves operations tooling to an admin', async () => {
    const res = await gql('{ deadLetterMessages(limit: 1) { topic } }', 'admin-token');

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deadLetterMessages).toEqual([]);
    expect(bufferService.getDeadLetterMessages).toHaveBeenCalledWith(1);
  });
});
