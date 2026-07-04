import { Test, TestingModule } from '@nestjs/testing';
import { RoomManagerResolver } from './room-manager.resolver';

describe('RoomManagerResolver', () => {
  let resolver: RoomManagerResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomManagerResolver],
    }).compile();

    resolver = module.get<RoomManagerResolver>(RoomManagerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
