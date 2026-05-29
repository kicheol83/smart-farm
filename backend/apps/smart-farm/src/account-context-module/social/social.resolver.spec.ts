import { Test, TestingModule } from '@nestjs/testing';
import { SocialResolver } from './social.resolver';

describe('SocialResolver', () => {
  let resolver: SocialResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialResolver],
    }).compile();

    resolver = module.get<SocialResolver>(SocialResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
