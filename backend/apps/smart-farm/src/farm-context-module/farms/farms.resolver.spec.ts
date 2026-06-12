import { Test, TestingModule } from '@nestjs/testing';
import { FarmsResolver } from './farms.resolver';

describe('FarmsResolver', () => {
  let resolver: FarmsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FarmsResolver],
    }).compile();

    resolver = module.get<FarmsResolver>(FarmsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
