import { Test, TestingModule } from '@nestjs/testing';
import { NdviResolver } from './ndvi.resolver';

describe('NdviResolver', () => {
  let resolver: NdviResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NdviResolver],
    }).compile();

    resolver = module.get<NdviResolver>(NdviResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
