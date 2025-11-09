import IGuessWhoCharacter from "../interfaces/guess-who-character";

export default interface IGuessWhoCharactersSelectedResponse {
  message: string;
  timestamp: string;
  characters: IGuessWhoCharacter[];
  pairCharacter: IGuessWhoCharacter;
}
