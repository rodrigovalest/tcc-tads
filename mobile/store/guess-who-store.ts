import IGuessWhoCharacter from "../models/interfaces/guess-who-character";
import { create } from "zustand";

type GuessWhoState = {
  characters: IGuessWhoCharacter[] | null;
  pairCharacter: IGuessWhoCharacter | null;
  setCharacters: (characters: IGuessWhoCharacter[]) => void;
  setPairCharacter: (character: IGuessWhoCharacter) => void;
  reset: () => void;
}

const useGuessWhoStore = create<GuessWhoState>((set, get) => ({
  characters: null,
  pairCharacter: null,

  setCharacters: (characters: IGuessWhoCharacter[]) => set({ characters }),
  setPairCharacter: (character: IGuessWhoCharacter) => set({ pairCharacter: character }),
  reset: () => set({ characters: null, pairCharacter: null }),
}));

export default useGuessWhoStore;
