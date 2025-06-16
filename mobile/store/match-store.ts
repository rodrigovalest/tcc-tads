// stores/useMatchStore.ts
import { create } from 'zustand';
import { MatchFormat } from '../models/types/match-format.type';
import { MatchLanguage } from '../models/types/match-language.type';
import { MatchMode } from '../models/types/match-mode.type';

type MatchState = {
  matchMode: MatchMode | null;
  matchFormat: MatchFormat | null;
  matchLanguage: MatchLanguage | null;
  roomId: string | null;

  setMatchMode: (mode: MatchMode) => Promise<void>;
  setMatchFormat: (format: MatchFormat) => Promise<void>;
  setMatchLanguage: (language: MatchLanguage) => Promise<void>;
  setRoomId: (roomId: string) => Promise<void>;
  resetMatch: () => Promise<void>;
};

const useMatchStore = create<MatchState>((set, get) => ({
  matchMode: null,
  matchFormat: null,
  matchLanguage: null,
  roomId:null,

  setMatchMode: async (matchMode) => {
    set({ matchMode });
  },

  setMatchFormat: async (matchFormat) => {
    set({ matchFormat });
  },

  setMatchLanguage: async (matchLanguage) => {
    set({ matchLanguage });
  },

  setRoomId: async (roomId: string) => {
    set({ roomId });
  },

  resetMatch: async () => {
    set({ matchMode: null, matchFormat: null, matchLanguage: null, roomId: null });
  },
}));

export default useMatchStore;
