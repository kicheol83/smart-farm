import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetResolver } from './password-reset.resolver';

describe('PasswordResetResolver', () => {
  let resolver: PasswordResetResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordResetResolver],
    }).compile();

    resolver = module.get<PasswordResetResolver>(PasswordResetResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
