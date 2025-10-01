import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private devices: Repository<Device>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  listByUser(userId: string) {
    return this.devices.find({ where: { owner: { id: userId } } });
  }

  async createForUser(userId: string, name: string) {
    const owner = await this.users.findOne({ where: { id: userId } });
    if (!owner) throw new NotFoundException('user not found');
    return this.devices.save(this.devices.create({ name, owner }));
  }

  async rename(userId: string, id: string, name: string) {
    const dev = await this.devices.findOne({ where: { id }, relations: ['owner'] });
    if (!dev || dev.owner.id !== userId) throw new NotFoundException();
    dev.name = name;
    return this.devices.save(dev);
  }

  async setTargetLux(userId: string, id: string, value: number) {
    const dev = await this.devices.findOne({ where: { id }, relations: ['owner'] });
    if (!dev || dev.owner.id !== userId) throw new NotFoundException();
    dev.targetLux = value;
    return this.devices.save(dev);
  }
}
