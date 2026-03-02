import { Test, TestingModule } from '@nestjs/testing';
import { MemberSettingsResolver } from './member-settings.resolver';

describe('MemberSettingsResolver', () => {
  let resolver: MemberSettingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberSettingsResolver],
    }).compile();

    resolver = module.get<MemberSettingsResolver>(MemberSettingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
