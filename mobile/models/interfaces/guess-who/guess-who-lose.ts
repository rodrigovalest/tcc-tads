import IGuessWhoCharacter from "./guess-who-character";

export default interface IGuessWhoLose {
  message: string;
  timestamp: string;
  status: "lose";
  buddyCharacter: IGuessWhoCharacter;
}
