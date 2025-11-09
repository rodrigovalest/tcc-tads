import { create } from "zustand";
import { MatchLanguage } from "../models/types/match-language.type";
import { InputMode } from "../models/types/input-mode.type";
import type { WordLevel } from "../services/translation/translation-service";

type TimeAttackVocabState = {
  sourceLanguage: MatchLanguage | null;
  targetLanguage: MatchLanguage | null;
  inputMode: InputMode | null;
  level: WordLevel | null;

  setSourceLanguage: (language: MatchLanguage) => Promise<void>;
  setTargetLanguage: (language: MatchLanguage) => Promise<void>;
  setInputMode: (mode: InputMode) => Promise<void>;
  setLevel: (level: WordLevel) => Promise<void>;
  resetTimeAttackVocab: () => Promise<void>;
  canSelectTargetLanguage: () => boolean;
};

const useTimeAttackVocabStore = create<TimeAttackVocabState>((set, get) => ({
  sourceLanguage: null,
  targetLanguage: null,
  inputMode: null,
  level: "basic",

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

  setLevel: async (level) => {
    set({ level });
  },

  resetTimeAttackVocab: async () => {
    set({
      sourceLanguage: null,
      targetLanguage: null,
      inputMode: null,
      level: "basic",
    });
  },

  canSelectTargetLanguage: () => {
    return get().sourceLanguage !== null;
  },
}));

export default useTimeAttackVocabStore;
