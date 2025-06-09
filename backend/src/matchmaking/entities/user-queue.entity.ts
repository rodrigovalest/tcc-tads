import { GameLanguage } from "src/match/entities/game-language.enum";
import { GameMode } from "src/match/entities/game-mode.enum";
import { GameType } from "src/match/entities/game-type.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserQueue {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  userId!: number;

  @Column({ unique: true, nullable: false })
  socketId!: string;

  @Column({ type: 'enum', enum: GameMode, nullable: false })
  gameMode!: GameMode;

  @Column({ type: 'enum', enum: GameType, nullable: false })
  gameType!: GameType;
  
  @Column({ type: 'enum', enum: GameLanguage, nullable: false })
  gameLanguage!: GameLanguage;

  @CreateDateColumn()
  joinedAt: Date;

  constructor (userId: number, socketId: string, gameMode: GameMode, gameType: GameType, gameLanguage: GameLanguage) {
    this.userId = userId;
    this.socketId = socketId;
    this.gameMode = gameMode;
    this.gameType = gameType;
    this.gameLanguage = gameLanguage;
  }
}
