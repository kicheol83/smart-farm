import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import request from 'supertest';
import { OwnershipService } from './ownership.service';
import { OwnershipInterceptor } from './ownership.interceptor';
import { AuthService } from '../account-context-module/auth/auth.service';
import { FieldsResolver } from '../farm-context-module/fields/fields.resolver';
import { FieldsService } from '../farm-context-module/fields/fields.service';
import { CropsResolver } from '../farm-context-module/crops/crops.resolver';
import { CropsService } from '../farm-context-module/crops/crops.service';
import { FieldMapResolver } from '../farm-context-module/field-map/field-map.resolver';
import { FieldMapService } from '../farm-context-module/field-map/field-map.service';
import { NdviResolver } from '../farm-context-module/ndvi/ndvi.resolver';
import { NdviService } from '../farm-context-module/ndvi/ndvi.service';
import { PlanHealthResolver } from '../farm-context-module/plan-health/plan-health.resolver';
import { PlanHealthService } from '../farm-context-module/plan-health/plan-health.service';
import { AlertsResolver } from '../ops-context-module/alerts/alerts.resolver';
import { AlertsService } from '../ops-context-module/alerts/alerts.service';
import { CommandResolver } from '../iot/command/command.resolver';
import { CommandService } from '../iot/command/command.service';
import { ActionLogResolver } from '../io-tcontext-module/action-log/action-log.resolver';
import { ActionLogService } from '../io-tcontext-module/action-log/action-log.service';
import { UploadResolver } from '../ops-context-module/upload/upload.resolver';
import { UploadService } from '../ops-context-module/upload/upload.service';
import { AutoIrrigationResolver } from '../irrigation/auto-irrigation/auto-irrigation.resolver';
import { AutoIrrigationService } from '../irrigation/auto-irrigation/auto-irrigation.service';
import { MemberResolver } from '../account-context-module/member/member.resolver';
import { MemberService } from '../account-context-module/member/member.service';

type Doc = Record<string, any>;

const id = () => new Types.ObjectId();
const same = (a: unknown, b: unknown) => String(a) === String(b);

const memberA = id();
const memberB = id();
const farmA = id();
const farmB = id();
const greenhouseA = id();
const greenhouseB = id();
const sectionA = id();
const sectionB = id();
const fieldA = id();
const fieldMapA = id();
const sectorA = id();
const deviceA = id();
const sensorA = id();
const alertA = id();
const commandA = id();

const collections: Record<string, Doc[]> = {
  farms: [
    { _id: farmA, memberId: memberA },
    { _id: farmB, memberId: memberB },
  ],
  greenHouses: [
    { _id: greenhouseA, farmsId: farmA },
    { _id: greenhouseB, farmsId: farmB },
  ],
  sections: [
    { _id: sectionA, greenHouseId: greenhouseA },
    { _id: sectionB, greenHouseId: greenhouseB },
  ],
  devices: [{ _id: deviceA, greenHouseId: greenhouseA }],
  sensors: [{ _id: sensorA, deviceId: deviceA }],
  cameras: [],
  actuators: [],
  automationRules: [],
  tasks: [],
  anomalyLogs: [],
  fields: [{ _id: fieldA, sectionId: sectionA }],
  fieldMaps: [{ _id: fieldMapA, farmId: farmA }],
  mapSectors: [{ _id: sectorA, fieldId: fieldMapA }],
  alerts: [{ _id: alertA, sensorsId: sensorA }],
  deviceCommands: [{ _id: commandA, deviceId: deviceA }],
};

const matches = (doc: Doc, filter: Doc) =>
  Object.entries(filter).every(([key, cond]) =>
    cond && typeof cond === 'object' && '$in' in cond
      ? cond.$in.some((v: unknown) => same(v, doc[key]))
      : same(cond, doc[key]),
  );

const fakeModel = (name: string) => ({
  findById: (docId: unknown) => {
    const doc = collections[name].find((d) => same(d._id, docId)) ?? null;
    const chain = { select: () => chain, lean: () => chain, exec: async () => doc };
    return chain;
  },
  find: (filter: Doc) => ({
    distinct: (key: string) => ({
      exec: async () => collections[name].filter((d) => matches(d, filter)).map((d) => d[key]),
    }),
  }),
});

const calls: string[] = [];

const serviceMock = (
  name: string,
  methods: string[],
  overrides: Record<string, (...a: any[]) => any> = {},
) =>
  Object.fromEntries(
    methods.map((method) => [
      method,
      jest.fn(async (...args: any[]) => {
        calls.push(`${name}.${method}`);
        return overrides[method] ? overrides[method](...args) : { _id: id() };
      }),
    ]),
  );

const tokens: Record<string, { _id: Types.ObjectId; memberRole: string }> = {
  'token-a': { _id: memberA, memberRole: 'WORKER' },
  'token-b': { _id: memberB, memberRole: 'WORKER' },
  'token-admin': { _id: id(), memberRole: 'ADMIN' },
};

const authService = {
  verifyToken: jest.fn(async (token: string) => {
    if (!tokens[token]) throw new Error('invalid token');
    return { ...tokens[token], memberFullName: 'Member' };
  }),
};

const fieldsFindAll = jest.fn(async () => []);

describe('resource ownership across the API', () => {
  let app: INestApplication;

  const gql = (query: string, token: string) =>
    request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query });

  const forbidden = (body: any) =>
    (body.errors ?? []).some((e: any) =>
      /do not have access|ONLY_SPECIFIC_ROLES|specific role|Forbidden/i.test(String(e.message)),
    );

  beforeAll(async () => {
    const modelProviders = Object.keys(collections).map((name) => ({
      provide: getModelToken(name),
      useValue: fakeModel(name),
    }));

    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [
        ...modelProviders,
        OwnershipService,
        { provide: APP_INTERCEPTOR, useClass: OwnershipInterceptor },
        { provide: AuthService, useValue: authService },
        FieldsResolver,
        CropsResolver,
        FieldMapResolver,
        NdviResolver,
        PlanHealthResolver,
        AlertsResolver,
        CommandResolver,
        ActionLogResolver,
        UploadResolver,
        AutoIrrigationResolver,
        MemberResolver,
        { provide: FieldsService, useValue: serviceMock('fields', ['create', 'findAll', 'findByCrop', 'findOne', 'remove', 'update'], { findAll: (...a: any[]) => (fieldsFindAll as any)(...a), remove: () => true }) },
        { provide: CropsService, useValue: serviceMock('crops', ['create', 'findAll', 'findOne', 'remove', 'update']) },
        { provide: FieldMapService, useValue: serviceMock('fieldMap', ['createFieldMap', 'createSector', 'findFieldMapsByFarm', 'getFieldAnalytics', 'getFieldMapWithSectors', 'getFieldNdviMap', 'removeFieldMap', 'removeSector', 'updateFieldMap', 'updateSector', 'updateSectorNdvi'], { removeSector: () => true }) },
        { provide: NdviService, useValue: serviceMock('ndvi', ['getFieldNdviHistory', 'getSectorTrend', 'record'], { getFieldNdviHistory: () => [] }) },
        { provide: PlanHealthService, useValue: serviceMock('planHealth', ['create', 'findByDateRange', 'findByField', 'findLatest'], { findByField: () => [] }) },
        { provide: AlertsService, useValue: serviceMock('alerts', ['checkThreshold', 'create', 'findBySensor', 'findNotifications', 'getActiveAlertsSummary', 'markAllAsRead', 'markAsRead', 'remove'], { remove: () => true }) },
        { provide: CommandService, useValue: serviceMock('command', ['findByDevice', 'findOne', 'sendCommand']) },
        { provide: ActionLogService, useValue: serviceMock('actionLog', ['findAll', 'findAllMembers']) },
        { provide: UploadService, useValue: serviceMock('upload', ['deleteFile', 'uploadFile'], { deleteFile: () => true }) },
        { provide: AutoIrrigationService, useValue: serviceMock('autoIrrigation', ['isAutoModeEnabled', 'manualIrrigate', 'setAutoMode', 'stopIrrigation'], { setAutoMode: () => undefined }) },
        { provide: MemberService, useValue: serviceMock('member', ['getAllMembersByAdmin', 'getManagerMember', 'getMember', 'login', 'signup', 'updateMember', 'updateMemberByAdmin']) },
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
    calls.length = 0;
    fieldsFindAll.mockClear();
  });

  const crossTenant: [string, string, string][] = [
    ['field by id', `{ field(id: "${fieldA}") { __typename } }`, 'fields.'],
    ['delete field', `mutation { deleteField(id: "${fieldA}") }`, 'fields.'],
    ['field map with sectors', `{ fieldMapWithSectors(fieldId: "${fieldMapA}") { __typename } }`, 'fieldMap.'],
    ['NDVI map', `{ fieldNdviMap(fieldId: "${fieldMapA}") { __typename } }`, 'fieldMap.'],
    ['delete sector', `mutation { deleteSector(id: "${sectorA}") }`, 'fieldMap.'],
    [
      'create sector on a field map',
      `mutation { createSector(input: { sectorName: "S1", sectorArea: 1, coordinates: [{ lat: 1, lng: 1 }, { lat: 1, lng: 2 }, { lat: 2, lng: 2 }], centerPoint: { lat: 1, lng: 1 }, fieldId: "${fieldMapA}" }) { __typename } }`,
      'fieldMap.',
    ],
    ['NDVI history', `{ fieldNdviHistory(fieldId: "${fieldA}") { __typename } }`, 'ndvi.'],
    ['sector NDVI trend', `{ sectorNdviTrend(sectorId: "${sectorA}") { __typename } }`, 'ndvi.'],
    ['plant health by field', `{ plantHealthByField(fieldsId: "${fieldA}") { __typename } }`, 'planHealth.'],
    ['delete alert', `mutation { deleteAlert(id: "${alertA}") }`, 'alerts.'],
    ['device command by id', `{ deviceCommand(id: "${commandA}") { __typename } }`, 'command.'],
    ['another member profile', `{ getMember(memberId: "${memberA}") { __typename } }`, 'member.'],
  ];

  it.each(crossTenant)("member B cannot reach member A's %s", async (_label, query, service) => {
    const res = await gql(query, 'token-b');

    expect(forbidden(res.body)).toBe(true);
    expect(calls.filter((c) => c.startsWith(service))).toEqual([]);
  });

  it.each(crossTenant)("member A still reaches their own %s", async (_label, query, service) => {
    await gql(query, 'token-a');

    expect(calls.some((c) => c.startsWith(service))).toBe(true);
  });

  it("lists only the member's own fields", async () => {
    await gql('{ fields { __typename } }', 'token-b');

    const [sections] = fieldsFindAll.mock.calls[0] as unknown as [Types.ObjectId[]];
    expect(sections.map(String)).toEqual([String(sectionB)]);
  });

  it('lists every field for an admin', async () => {
    await gql('{ fields { __typename } }', 'token-admin');

    expect(fieldsFindAll.mock.calls[0]).toEqual([undefined]);
  });

  it.each([
    ['change the shared crop catalog', 'mutation { createCrop(input: { cropsName: "Rice", cropsOptionalTemps: 25, cropsOptionalMoistures: 60 }) { __typename } }', 'crops.'],
    ["read every member's action log", '{ allActionLogs(input: { page: 1, limit: 5, from: "2026-01-01", to: "2026-12-31" }) { __typename } }', 'actionLog.'],
    ['delete any stored file', 'mutation { deleteFile(key: "avatars/someone.png") }', 'upload.'],
    ['switch automatic irrigation off for everyone', 'mutation { setAutoIrrigationMode(enabled: false) { __typename } }', 'autoIrrigation.'],
  ])('a worker cannot %s', async (_label, query, service) => {
    const worker = await gql(query, 'token-b');
    expect(forbidden(worker.body)).toBe(true);
    expect(calls.filter((c) => c.startsWith(service))).toEqual([]);

    await gql(query, 'token-admin');
    expect(calls.some((c) => c.startsWith(service))).toBe(true);
  });
});
