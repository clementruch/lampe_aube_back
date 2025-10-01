import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

const DEMO_EMAIL = 'demo@aube.app';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly svc: DevicesService,
    private readonly ds: DataSource,
  ) {}

  // ToDo : JWT
  // Récupère l’id du user à partir de l’email (temporaire avant JWT)
  private async getUserIdByEmail(email: string): Promise<string> {
    const u = await this.ds.getRepository(User).findOne({ where: { email } });
    if (!u) {
      throw new Error('Demo user not found — vérifie le seed dans main.ts');
    }
    return u.id;
    // Plus tard, avec le JWT: on ne fera plus ça ici
  }

  @Get()
  async list() {
    const userId = await this.getUserIdByEmail(DEMO_EMAIL);
    return this.svc.listByUser(userId);
  }

  @Post()
  async create(@Body() dto: { name: string }) {
    const userId = await this.getUserIdByEmail(DEMO_EMAIL);
    return this.svc.createForUser(userId, dto.name);
  }

  @Patch(':id/name')
  async rename(@Param('id') id: string, @Body() dto: { name: string }) {
    const userId = await this.getUserIdByEmail(DEMO_EMAIL);
    return this.svc.rename(userId, id, dto.name);
  }

  @Patch(':id/targetLux')
  async setTargetLux(@Param('id') id: string, @Body() dto: { value: number }) {
    const userId = await this.getUserIdByEmail(DEMO_EMAIL);
    return this.svc.setTargetLux(userId, id, dto.value);
  }
}
