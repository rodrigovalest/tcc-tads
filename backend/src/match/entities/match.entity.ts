import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserQueue {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  userId!: number;

  @Column({ unique: true, nullable: false })
  socketId!: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
