import { Test, TestingModule } from '@nestjs/testing';
import { CropsResolver } from './crops.resolver';

describe('CropsResolver', () => {
  let resolver: CropsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CropsResolver],
    }).compile();

    resolver = module.get<CropsResolver>(CropsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
