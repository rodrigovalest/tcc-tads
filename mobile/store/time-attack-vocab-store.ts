import { create } from "zustand";
import { MatchLanguage } from "../models/types/match-language.type";
import { InputMode } from "../models/types/input-mode.type";

type TimeAttackVocabState = {
  sourceLanguage: MatchLanguage | null;
  targetLanguage: MatchLanguage | null;
  inputMode: InputMode | null;

  setSourceLanguage: (language: MatchLanguage) => Promise<void>;
  setTargetLanguage: (language: MatchLanguage) => Promise<void>;
  setInputMode: (mode: InputMode) => Promise<void>;
  resetTimeAttackVocab: () => Promise<void>;
  canSelectTargetLanguage: () => boolean;
};

const useTimeAttackVocabStore = create<TimeAttackVocabState>((set, get) => ({
  sourceLanguage: null,
  targetLanguage: null,
  inputMode: null,

  setSourceLanguage: async (language) => {
    set({ sourceLanguage: language });
    if (get().targetLanguage === language) {
      set({ targetLanguage: null });
    }
  },

  setTargetLanguage: async (language) => {
    const { sourceLanguage } = get();
    if (sourceLanguage && sourceLanguage !== language) {
      set({ targetLanguage: language });
    }
  },

  setInputMode: async (mode) => {
    set({ inputMode: mode });
  },

  resetTimeAttackVocab: async () => {
    set({
      sourceLanguage: null,
      targetLanguage: null,
      inputMode: null,
    });
  },

  canSelectTargetLanguage: () => {
    return get().sourceLanguage !== null;
  },
}));

export default useTimeAttackVocabStore;
