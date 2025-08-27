import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserInterestTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ length: 100 })
  topic: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  constructor() {
  }
} 