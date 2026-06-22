import { Test, TestingModule } from '@nestjs/testing';
import { NdviService } from './ndvi.service';

describe('NdviService', () => {
  let service: NdviService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NdviService],
    }).compile();

    service = module.get<NdviService>(NdviService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
