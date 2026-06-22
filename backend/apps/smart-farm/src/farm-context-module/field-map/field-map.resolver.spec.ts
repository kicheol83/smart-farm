import { Test, TestingModule } from '@nestjs/testing';
import { FieldMapResolver } from './field-map.resolver';

describe('FieldMapResolver', () => {
  let resolver: FieldMapResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMapResolver],
    }).compile();

    resolver = module.get<FieldMapResolver>(FieldMapResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
