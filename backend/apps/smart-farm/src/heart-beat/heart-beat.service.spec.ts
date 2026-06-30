import { Test, TestingModule } from '@nestjs/testing';
import { HeartBeatService } from './heart-beat.service';

describe('HeartBeatService', () => {
  let service: HeartBeatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeartBeatService],
    }).compile();

    service = module.get<HeartBeatService>(HeartBeatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
