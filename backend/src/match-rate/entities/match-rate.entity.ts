import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Match } from "../../match/entities/match.entity";

@Entity()
@Unique(["match", "reviewer", "reviewed"])
export class MatchRate {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, (match) => match.id, { nullable: false, onDelete: "CASCADE" })
  match: Match;

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: "CASCADE" })
  reviewer: User;

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: "CASCADE" })
  reviewed: User;

  @Column({ type: "int", nullable: false })
  fluencyScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
