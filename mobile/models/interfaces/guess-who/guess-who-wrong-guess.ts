import IGuessWhoCharacter from "./guess-who-character";

export default interface IGuessWhoWrongGuess {
  message: string;
  timestamp: string;
  status: "buddy_wrong_guess" | "wrong_guess";
  guessCharacter: IGuessWhoCharacter;
}
