import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(username: string, email: string, password: string): Promise<void> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await this.userRepository.save(new User(
      username,
      email,
      hashedPassword,
    ));
  }
}
