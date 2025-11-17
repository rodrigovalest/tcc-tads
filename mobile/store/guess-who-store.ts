import { GuessWhoGameStatus } from "../models/types/guess-who-game-status.type";
import IGuessWhoCharacter from "../models/interfaces/guess-who-character";
import { create } from "zustand";

type GuessWhoState = {
  characters: IGuessWhoCharacter[] | null;
  pairCharacter: IGuessWhoCharacter | null;
  status: GuessWhoGameStatus | null;
  roundStartTime: string | null;
  roundEndTime: string | null;
  answer: boolean | null;

  eliminated: Record<string, boolean>;

  setCharacters: (characters: IGuessWhoCharacter[]) => void;
  setPairCharacter: (character: IGuessWhoCharacter) => void;
  setStatus: (status: GuessWhoGameStatus) => void;
  setRoundTime: (startTime: string | null, endTime: string | null) => void;
  setAnswer: (answer: boolean | null) => void;

  toggleEliminated: (id: string) => void;

  reset: () => void;
};

const useGuessWhoStore = create<GuessWhoState>((set, get) => ({
  characters: null,
  pairCharacter: null,
  status: null,
  roundStartTime: null,
  roundEndTime: null,
  answer: null,

  eliminated: {},

  setCharacters: (characters) => set({ characters }),
  setPairCharacter: (character) => set({ pairCharacter: character }),
  setStatus: (status) => set({ status }),
  setRoundTime: (startTime, endTime) =>
    set({ roundStartTime: startTime, roundEndTime: endTime }),
  setAnswer: (answer) => set({ answer }),

  toggleEliminated: (id) =>
    set((state) => ({
      eliminated: {
        ...state.eliminated,
        [id]: !state.eliminated[id],
      },
    })),

  reset: () =>
    set({
      characters: null,
      pairCharacter: null,
      status: null,
      roundStartTime: null,
      roundEndTime: null,
      eliminated: {},
    }),
}));

export default useGuessWhoStore;
