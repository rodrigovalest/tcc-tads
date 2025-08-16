import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { User } from "../../user/entities/user.entity";
import { MatchStatus } from "../../match/entities/match-status.enum";

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

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    mode: MatchMode,
    format: MatchFormat,
    language: MatchLanguage,
    users: User[],
    status: MatchStatus = MatchStatus.NOT_STARTED
  ) {
    this.mode = mode;
    this.format = format;
    this.language = language;
    this.users = users;
    this.status = status;
  }
}
