import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum FriendshipRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

@Entity()
export class FriendshipRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  requester: User;

  @Column()
  requesterId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  addressee: User;

  @Column()
  addresseeId: number;

  @Column({ 
    type: 'enum', 
    enum: FriendshipRequestStatus, 
    default: FriendshipRequestStatus.PENDING 
  })
  status: FriendshipRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(requesterId: number, addresseeId: number) {
    this.requesterId = requesterId;
    this.addresseeId = addresseeId;
    this.status = FriendshipRequestStatus.PENDING;
  }
}

