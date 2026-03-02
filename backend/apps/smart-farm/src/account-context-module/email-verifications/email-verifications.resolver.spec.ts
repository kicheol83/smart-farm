import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerificationsResolver } from './email-verifications.resolver';

describe('EmailVerificationsResolver', () => {
  let resolver: EmailVerificationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailVerificationsResolver],
    }).compile();

    resolver = module.get<EmailVerificationsResolver>(EmailVerificationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
