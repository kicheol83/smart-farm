import { Types } from 'mongoose';
import { PasswordResetService } from './password-reset/password-reset.service';
import { EmailVerificationService } from './email-verifications/email-verifications.service';

type Doc = Record<string, any>;

function otpStore(usedField: string) {
  const docs: Doc[] = [];

  const matches = (doc: Doc, filter: Doc) =>
    Object.entries(filter).every(([key, cond]) => {
      if (key === 'attempts') return !((doc.attempts ?? undefined) >= cond.$not.$gte);
      if (cond === null) return doc[key] === null || doc[key] === undefined;
      return String(doc[key]) === String(cond);
    });

  const latest = (filter: Doc) =>
    docs
      .filter((d) => matches(d, filter))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const withSave = (doc: Doc | undefined) =>
    doc ? Object.assign(Object.create({ save: async () => doc }), doc, { save: async function (this: Doc) { Object.assign(doc, this); return doc; } }) : null;

  return {
    docs,
    deleteMany: async (filter: Doc) => {
      for (let i = docs.length - 1; i >= 0; i--) if (matches(docs[i], filter)) docs.splice(i, 1);
    },
    create: async (doc: Doc) => {
      const saved = { _id: new Types.ObjectId(), createdAt: new Date(), attempts: 0, ...doc };
      docs.push(saved);
      return saved;
    },
    findOne: (filter: Doc) => {
      const chain = {
        sort: () => chain,
        select: () => chain,
        exec: async () => withSave(latest(filter)),
      };
      return chain;
    },
    findOneAndUpdate: (filter: Doc, update: Doc) => {
      const doc = latest(filter);
      if (doc) doc.attempts = (doc.attempts ?? 0) + (update.$inc?.attempts ?? 0);
      return { exec: async () => withSave(doc) };
    },
    findByIdAndUpdate: async (id: unknown, update: Doc) => {
      const doc = docs.find((d) => String(d._id) === String(id));
      if (doc) Object.assign(doc, update);
      return doc;
    },
    usedField,
  };
}

const wrongCodeFor = (code: string) => (code === '000000' ? '111111' : '000000');

describe.each([
  ['password reset', () => {
    const store = otpStore('usedAt');
    return { store, service: new PasswordResetService(store as any) as any };
  }],
  ['email verification', () => {
    const store = otpStore('verifiedAt');
    return { store, service: new EmailVerificationService(store as any) as any };
  }],
])('%s code', (_label, build) => {
  const memberId = new Types.ObjectId();
  let store: ReturnType<typeof otpStore>;
  let service: any;

  beforeEach(() => {
    ({ store, service } = build());
  });

  it('accepts the right code on the first try', async () => {
    const code = await service.generateAndSave(memberId);

    await expect(service.verify(memberId, code)).resolves.toBeTruthy();
  });

  it('refuses the right code after five wrong ones', async () => {
    const code = await service.generateAndSave(memberId);
    for (let i = 0; i < 5; i++) {
      await expect(service.verify(memberId, wrongCodeFor(code))).rejects.toThrow();
    }

    await expect(service.verify(memberId, code)).rejects.toThrow(/too many attempts/);
  });

  it('evaluates at most five of twenty parallel guesses', async () => {
    const code = await service.generateAndSave(memberId);
    const guesses = Array.from({ length: 20 }, (_, i) => (i === 9 ? code : wrongCodeFor(code)));

    const results = await Promise.allSettled(guesses.map((g) => service.verify(memberId, g)));

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(0);
    expect(store.docs[0].attempts).toBe(5);
  });

  it('still verifies a code stored before attempts were counted', async () => {
    store.docs.push({
      _id: new Types.ObjectId(),
      memberId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      passwordToken: '424242',
      emailCode: '424242',
      [store.usedField]: null,
    });

    await expect(service.verify(memberId, '424242')).resolves.toBeTruthy();
  });

  it('creates six-digit codes without Math.random', async () => {
    const spy = jest.spyOn(Math, 'random');
    const code = await service.generateAndSave(memberId);

    expect(code).toMatch(/^\d{6}$/);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
