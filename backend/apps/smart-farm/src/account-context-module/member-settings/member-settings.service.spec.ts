import { Test, TestingModule } from '@nestjs/testing';
import { MemberSettingsService } from './member-settings.service';

describe('MemberSettingsService', () => {
  let service: MemberSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberSettingsService],
    }).compile();

    service = module.get<MemberSettingsService>(MemberSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
