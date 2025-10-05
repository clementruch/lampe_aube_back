import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async signup(email: string, password: string) {
    const exists = await this.users.findByEmail(email);
    if (exists) throw new BadRequestException('Email already used');
    const passwordHash = await bcrypt.hash(password, 10);
    const u = await this.users.create(email, passwordHash);
    return this.issueToken(u.id, u.email);
  }

  async login(email: string, password: string) {
    const u = await this.users.findByEmail(email);
    if (!u) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueToken(u.id, u.email);
  }

  private issueToken(sub: string, email: string) {
    const access_token = this.jwt.sign({ sub, email });
    return { access_token };
  }
}
