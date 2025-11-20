import { GuessWhoGameStatus } from "../models/types/guess-who-game-status.type";
import IGuessWhoCharacter from "../models/interfaces/guess-who/guess-who-character";
import { create } from "zustand";

type GuessWhoState = {
  characters: IGuessWhoCharacter[] | null;
  yourCharacter: IGuessWhoCharacter | null;
  status: GuessWhoGameStatus | null;
  roundStartTime: string | null;
  roundEndTime: string | null;
  answer: boolean | null;
  guessCharacter: IGuessWhoCharacter | null;
  buddyCharacterWhenLose: IGuessWhoCharacter | null;

  eliminated: Record<string, boolean>;

  setCharacters: (characters: IGuessWhoCharacter[]) => void;
  setYourCharacter: (character: IGuessWhoCharacter) => void;
  setStatus: (status: GuessWhoGameStatus) => void;
  setRoundTime: (startTime: string | null, endTime: string | null) => void;
  setAnswer: (answer: boolean | null) => void;
  setGuessCharacter: (character: IGuessWhoCharacter) => void;
  setBuddyCharacterWhenLose: (character: IGuessWhoCharacter) => void;

  toggleEliminated: (id: string) => void;
  clearAnswer: () => void;

  resetRound: () => void;
  reset: () => void;
};

const useGuessWhoStore = create<GuessWhoState>((set, get) => ({
  characters: null,
  yourCharacter: null,
  status: null,
  roundStartTime: null,
  roundEndTime: null,
  answer: null,
  guessCharacter: null,
  buddyCharacterWhenLose: null,

  eliminated: {},

  setCharacters: (characters) => set({ characters }),
  setYourCharacter: (character) => set({ yourCharacter: character }),
  setStatus: (status) => set({ status }),
  setRoundTime: (startTime, endTime) =>
    set({ roundStartTime: startTime, roundEndTime: endTime }),
  setAnswer: (answer) => set({ answer }),
  setGuessCharacter: (character) => set({ guessCharacter: character }),
  setBuddyCharacterWhenLose: (character) => set({ buddyCharacterWhenLose: character }),

  toggleEliminated: (id) =>
    set((state) => ({
      eliminated: {
        ...state.eliminated,
        [id]: !state.eliminated[id],
      },
    })),
  clearAnswer: () => set({ answer: null }),

  resetRound: () => {
    set({
      answer: null,
      guessCharacter: null,
      buddyCharacterWhenLose: null,
      roundStartTime: null,
      roundEndTime: null,
    });
  },
  reset: () =>
    set({
      characters: null,
      yourCharacter: null,
      status: null,
      roundStartTime: null,
      roundEndTime: null,
      eliminated: {},
      answer: null,
      guessCharacter: null,
      buddyCharacterWhenLose: null,
    }),
}));

export default useGuessWhoStore;
