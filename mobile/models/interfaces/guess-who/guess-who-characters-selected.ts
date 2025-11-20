import IGuessWhoCharacter from "./guess-who-character";

export default interface IGuessWhoCharactersSelected {
  message: string;
  timestamp: string;
  characters: IGuessWhoCharacter[];
  yourCharacter: IGuessWhoCharacter;
}
