import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService } from '../services/matchmaking.service';
import { MatchmakingGateway } from './matchmaking.gateway';

describe('MatchmakingGateway', () => {
  let gateway: MatchmakingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchmakingGateway, MatchmakingService],
    }).compile();

    gateway = module.get<MatchmakingGateway>(MatchmakingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
