import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async create(email: string, passwordHash: string) {
    const u = this.repo.create({ email, passwordHash });
    return this.repo.save(u);
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
