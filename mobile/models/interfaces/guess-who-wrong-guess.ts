import IGuessWhoCharacter from "./guess-who-character";

export default interface IGuessWhoWrongGuess {
  message: string;
  timestamp: string;
  status: "result";
  guessCharacter: IGuessWhoCharacter;
}
