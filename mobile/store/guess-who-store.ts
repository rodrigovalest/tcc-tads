import { GuessWhoGameStatus } from "../models/types/guess-who-game-status.type";
import IGuessWhoCharacter from "../models/interfaces/guess-who-character";
import { create } from "zustand";

type GuessWhoState = {
  characters: IGuessWhoCharacter[] | null;
  pairCharacter: IGuessWhoCharacter | null;
  status: GuessWhoGameStatus | null;
  roundStartTime: string | null,
  roundEndTime: string | null,
  answer: boolean | null,
  setCharacters: (characters: IGuessWhoCharacter[]) => void;
  setPairCharacter: (character: IGuessWhoCharacter) => void;
  setStatus: (status: GuessWhoGameStatus) => void;
  setRoundTime: (startTime: string | null, endTime: string | null) => void;
  setAnswer: (answer: boolean | null) => void;
  reset: () => void;
}

const useGuessWhoStore = create<GuessWhoState>((set, get) => ({
  characters: null,
  pairCharacter: null,
  status: null,
  roundStartTime: null,
  roundEndTime: null,
  answer: null,

  setCharacters: (characters: IGuessWhoCharacter[]) => set({ characters }),
  
  setPairCharacter: (character: IGuessWhoCharacter) => set({ pairCharacter: character }),
  
  setStatus: (status: GuessWhoGameStatus) => set({ status: status }),

  setRoundTime: (startTime: string | null, endTime: string | null) => {
    set({ roundStartTime: startTime, roundEndTime: endTime });
  },
  
  setAnswer: (answer: boolean | null) => set({ answer }),
  
  reset: () => set({ characters: null, pairCharacter: null, status: null, roundStartTime: null, roundEndTime: null }),
}));

export default useGuessWhoStore;
