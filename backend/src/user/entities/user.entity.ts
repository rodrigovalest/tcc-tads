import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CountryCode } from "./country-code.enum";
import { UserMatch } from "../../match/entities/user-match.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @Column({ type: 'enum', enum: CountryCode, nullable: false })
  nationality: CountryCode;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => UserMatch, userMatch => userMatch.user)
  userMatches: UserMatch[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(username: string, email: string, password: string, nationality: CountryCode) {
    this.username = username;
    this.email = email;
    this.nationality = nationality;
    this.password = password;
    this.isActive = true;
  }
}
