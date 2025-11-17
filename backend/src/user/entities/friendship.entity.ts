import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  friend: User;

  @Column()
  friendId: number;

  @CreateDateColumn()
  createdAt: Date;

  constructor(userId: number, friendId: number) {
    this.userId = userId;
    this.friendId = friendId;
  }
}

