import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MatchMode } from './match-mode.enum';
import { MatchLanguage } from './match-language.enum';

export enum GameInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity()
export class GameInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  inviter: User;

  @Column()
  inviterId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  invitee: User;

  @Column()
  inviteeId: number;

  @Column({ type: 'enum', enum: MatchMode })
  matchMode: MatchMode;

  @Column({ type: 'enum', enum: MatchLanguage })
  matchLanguage: MatchLanguage;

  @Column({
    type: 'enum',
    enum: GameInviteStatus,
    default: GameInviteStatus.PENDING,
  })
  status: GameInviteStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  constructor(
    inviterId: number,
    inviteeId: number,
    matchMode: MatchMode,
    matchLanguage: MatchLanguage,
  ) {
    this.inviterId = inviterId;
    this.inviteeId = inviteeId;
    this.matchMode = matchMode;
    this.matchLanguage = matchLanguage;
    this.status = GameInviteStatus.PENDING;
    this.expiresAt = new Date(Date.now() + 30000);
  }
}

