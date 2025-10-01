import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from '../entities/alarm.entity';
import { Device } from '../entities/device.entity';

@Injectable()
export class AlarmsService {
  constructor(
    @InjectRepository(Alarm) private alarms: Repository<Alarm>,
    @InjectRepository(Device) private devices: Repository<Device>,
  ) {}

  async list(deviceId: string) {
    return this.alarms.find({ where: { device: { id: deviceId } } });
  }

  async create(deviceId: string, dto: {
    hour: number; minute: number; days: number[]; durationMinutes: number; enabled: boolean;
  }) {
    const device = await this.devices.findOne({ where: { id: deviceId } });
    if (!device) throw new NotFoundException('device not found');
    return this.alarms.save(this.alarms.create({ ...dto, device }));
  }

  async update(id: string, dto: Partial<{
    hour: number; minute: number; days: number[]; durationMinutes: number; enabled: boolean;
  }>) {
    const a = await this.alarms.findOne({ where: { id } });
    if (!a) throw new NotFoundException('alarm not found');
    Object.assign(a, dto);
    return this.alarms.save(a);
  }

  async remove(id: string) {
    await this.alarms.delete(id);
    return { ok: true };
  }
}
