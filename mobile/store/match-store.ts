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

  setMatchMode: (mode: MatchMode) => Promise<void>;
  setMatchFormat: (format: MatchFormat) => Promise<void>;
  setMatchLanguage: (language: MatchLanguage) => Promise<void>;
  setInputMode: (mode: InputMode) => Promise<void>;
  setMatchId: (matchId: string) => Promise<void>;
  setIsOfferer: (isOfferer: boolean) => Promise<void>;
  setUserBuddy: (buddy: IUserBuddy) => Promise<void>;
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

  resetMatch: async () => {
    set({
      matchMode: null,
      matchFormat: null,
      matchLanguage: null,
      inputMode: null,
      matchId: null,
      isOfferer: null,
      buddy: null,
    });
  },
}));

export default useMatchStore;
