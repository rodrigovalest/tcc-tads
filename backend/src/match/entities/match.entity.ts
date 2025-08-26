import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { MatchStatus } from "../../match/entities/match-status.enum";
import { UserMatch } from "./user-match.entity";

@Entity()
export class Match {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'enum', enum: MatchMode, nullable: false })
  mode!: MatchMode;
  
  @Column({ type: 'enum', enum: MatchFormat, nullable: false })
  format!: MatchFormat;

  @Column({ type: 'enum', enum: MatchLanguage, nullable: false })
  language!: MatchLanguage;

  @Column({ type: 'enum', enum: MatchStatus, nullable: false })
  status!: MatchStatus;

  @OneToMany(() => UserMatch, userMatch => userMatch.match)
  userMatches: UserMatch[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    mode: MatchMode,
    format: MatchFormat,
    language: MatchLanguage,
    status: MatchStatus = MatchStatus.IN_PROGRESS
  ) {
    this.mode = mode;
    this.format = format;
    this.language = language;
    this.status = status;
  }
}
