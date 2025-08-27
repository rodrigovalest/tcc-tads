import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findOne(options: FindOneOptions<User>): Promise<User | null> {
    return this.repository.findOne(options);
  }

  async find(options?: FindManyOptions<User>): Promise<User[]> {
    return this.repository.find(options);
  }

  async findById(id: number): Promise<User | null> {
    if (!id || id <= 0) {
      return null;
    }
    return this.repository.findOne({
      where: { id },
      relations: ['languages', 'interestTopics']
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email?.trim()) {
      return null;
    }
    return this.repository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: ['languages', 'interestTopics']
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    if (!username?.trim()) {
      return null;
    }
    return this.repository.findOne({
      where: { username: username.trim() },
      relations: ['languages', 'interestTopics']
    });
  }
}
