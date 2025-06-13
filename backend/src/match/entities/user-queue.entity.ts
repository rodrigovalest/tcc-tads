import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserQueue {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  userId!: number;

  @Column({ unique: true, nullable: false })
  socketId!: string;

  @Column({ type: 'enum', enum: MatchMode, nullable: false })
  matchMode!: MatchMode;

  @Column({ type: 'enum', enum: MatchFormat, nullable: false })
  matchFormat!: MatchFormat;
  
  @Column({ type: 'enum', enum: MatchLanguage, nullable: false })
  matchLanguage!: MatchLanguage;

  @CreateDateColumn()
  joinedAt: Date;

  constructor (userId: number, socketId: string, matchMode: MatchMode, matchFormat: MatchFormat, matchLanguage: MatchLanguage) {
    this.userId = userId;
    this.socketId = socketId;
    this.matchMode = matchMode;
    this.matchFormat = matchFormat;
    this.matchLanguage = matchLanguage;
  }
}
