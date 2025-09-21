import { MatchFormat } from '../entities/match-format.enum';
import { MatchMode } from '../entities/match-mode.enum';

export type MatchModeConfig = {
  allowedTypes: MatchFormat[];
  usesWebRTC: boolean;
  requiresMatchmaking: boolean;
  maxPlayers: number;
  minPlayers: number;
  groupAllowed: boolean;
};

export const MATCH_MODE_CONFIGS: Record<MatchMode, MatchModeConfig> = {
  [MatchMode.JUST_CHILLING]: {
    allowedTypes: [MatchFormat.DUO],
    usesWebRTC: true,
    requiresMatchmaking: true,
    maxPlayers: 2,
    minPlayers: 2,
    groupAllowed: false,
  },
  [MatchMode.WORD_BUILDER]: {
    allowedTypes: [MatchFormat.SOLO],
    usesWebRTC: false,
    requiresMatchmaking: false,
    maxPlayers: 1,
    minPlayers: 1,
    groupAllowed: false,
  },
  [MatchMode.WHO_AM_I]: {
    allowedTypes: [MatchFormat.DUO],
    usesWebRTC: true,
    requiresMatchmaking: true,
    maxPlayers: 2,
    minPlayers: 2,
    groupAllowed: false,
  },
};
