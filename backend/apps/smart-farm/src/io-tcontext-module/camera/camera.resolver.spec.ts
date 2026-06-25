import { Test, TestingModule } from '@nestjs/testing';
import { CameraResolver } from './camera.resolver';

describe('CameraResolver', () => {
  let resolver: CameraResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CameraResolver],
    }).compile();

    resolver = module.get<CameraResolver>(CameraResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
