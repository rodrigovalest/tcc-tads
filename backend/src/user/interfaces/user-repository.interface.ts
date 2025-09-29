import { User } from '../entities/user.entity';
import { FindManyOptions, FindOneOptions } from 'typeorm';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findOne(options: FindOneOptions<User>): Promise<User | null>;
  find(options?: FindManyOptions<User>): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  update(id: number, updateData: Partial<User>): Promise<void>;
}
