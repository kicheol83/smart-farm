import { Test, TestingModule } from '@nestjs/testing';
import { RoomManagerService } from './room-manager.service';

describe('RoomManagerService', () => {
  let service: RoomManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomManagerService],
    }).compile();

    service = module.get<RoomManagerService>(RoomManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
