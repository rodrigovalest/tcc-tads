import { create } from "zustand";
import { MatchFormat } from "../models/types/match-format.type";
import { MatchLanguage } from "../models/types/match-language.type";
import { MatchMode } from "../models/types/match-mode.type";
import { InputMode } from "../models/types/input-mode.type";
import IUserBuddy from "../models/interfaces/user-buddy";

type MatchState = {
  matchMode: MatchMode | null;
  matchFormat: MatchFormat | null;
  matchLanguage: MatchLanguage | null;
  inputMode: InputMode | null;
  matchId: string | null;
  isOfferer: boolean | null;
  buddy: IUserBuddy | null;
  timerStartTimestamp: number | null;
  timerDurationMs: number;
  timerServerOffset: number; // Offset entre o relógio do servidor e do cliente

  setMatchMode: (mode: MatchMode) => Promise<void>;
  setMatchFormat: (format: MatchFormat) => Promise<void>;
  setMatchLanguage: (language: MatchLanguage) => Promise<void>;
  setInputMode: (mode: InputMode) => Promise<void>;
  setMatchId: (matchId: string) => Promise<void>;
  setIsOfferer: (isOfferer: boolean) => Promise<void>;
  setUserBuddy: (buddy: IUserBuddy) => Promise<void>;
  setTimer: (startTimestamp: number, durationMs: number, serverOffset?: number) => Promise<void>;
  resetMatch: () => Promise<void>;
};

const useMatchStore = create<MatchState>((set, get) => ({
  matchMode: null,
  matchFormat: null,
  matchLanguage: null,
  inputMode: null,
  matchId: null,
  isOfferer: null,
  buddy: null,
  timerStartTimestamp: null,
  timerDurationMs: 120000, // 120 segundos padrão
  timerServerOffset: 0, // Offset inicial

  setMatchMode: async (matchMode) => {
    set({ matchMode });
  },

  setMatchFormat: async (matchFormat) => {
    set({ matchFormat });
  },

  setMatchLanguage: async (matchLanguage) => {
    set({ matchLanguage });
  },

  setInputMode: async (inputMode) => {
    set({ inputMode });
  },

  setMatchId: async (matchId: string) => {
    set({ matchId });
  },

  setIsOfferer: async (isOfferer: boolean) => {
    set({ isOfferer });
  },
  
  setUserBuddy: async (buddy: IUserBuddy) => {
    set({ buddy });
  },

  setTimer: async (startTimestamp: number, durationMs: number, serverOffset?: number) => {
    set({ 
      timerStartTimestamp: startTimestamp, 
      timerDurationMs: durationMs,
      timerServerOffset: serverOffset ?? 0,
    });
  },

  resetMatch: async () => {
    set({
      matchMode: null,
      matchFormat: null,
      matchLanguage: null,
      inputMode: null,
      matchId: null,
      isOfferer: null,
      buddy: null,
      timerStartTimestamp: null,
      timerDurationMs: 120000,
      timerServerOffset: 0,
    });
  },
}));

export default useMatchStore;
