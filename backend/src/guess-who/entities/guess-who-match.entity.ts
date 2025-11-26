import { GuessWhoCharacter } from "./guess-who-character.entity";
import { GuessWhoStage } from "./guess-who-stage.enum";

export class GuessWhoMatch {
  matchId: string;
  user1Id: number;
  user2Id: number;
  user1SocketId: string;
  user2SocketId: string;
  user1Character: GuessWhoCharacter;
  user2Character: GuessWhoCharacter;
  stage: GuessWhoStage;
  characters: GuessWhoCharacter[];
  userIdTurn: number;

  constructor(
    matchId: string,
    user1Id: number,
    user2Id: number,
    user1SocketId: string,
    user2SocketId: string,
    characters: GuessWhoCharacter[],
    user1Character: GuessWhoCharacter,
    user2Character: GuessWhoCharacter,
    userIdTurn: number,
  ) {
    this.matchId = matchId;
    this.user1Id = user1Id;
    this.user2Id = user2Id;
    this.user1SocketId = user1SocketId;
    this.user2SocketId = user2SocketId;
    this.characters = characters;
    this.user1Character = user1Character;
    this.user2Character = user2Character;
    this.stage = GuessWhoStage.QUESTIONING;
    this.userIdTurn = userIdTurn;
  }
}
