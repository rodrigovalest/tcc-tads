import { User } from "../../user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Match } from "./match.entity";

@Entity()
export class UserMatch {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Match, { nullable: false })
  match: Match;

  @Column({ type: 'varchar', length: 255, nullable: false })
  socketId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(user: User, match: Match, socketId: string) {
    this.user = user;
    this.match = match;
    this.socketId = socketId;
  }
}
