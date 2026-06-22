import { Test, TestingModule } from '@nestjs/testing';
import { FieldMapService } from './field-map.service';

describe('FieldMapService', () => {
  let service: FieldMapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMapService],
    }).compile();

    service = module.get<FieldMapService>(FieldMapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
