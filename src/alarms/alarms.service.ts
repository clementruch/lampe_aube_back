import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from '../entities/alarm.entity';
import { Device } from '../entities/device.entity';
import { User } from '../entities/user.entity';

type AlarmDto = {
  hour: number;
  minute: number;
  days: number[];
  durationMinutes: number;
  enabled: boolean;
  sunrise: boolean;
  label?: string | null;
  deviceId?: string | null;
};

@Injectable()
export class AlarmsService {
  constructor(
    @InjectRepository(Alarm) private alarms: Repository<Alarm>,
    @InjectRepository(Device) private devices: Repository<Device>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  // ----- helpers -------------------------------------------------------------

  private normalizeDays(days?: number[]): number[] {
    if (!Array.isArray(days)) return [];
    const set = new Set<number>();
    for (const d of days) {
      const n = Number(d) | 0;
      if (n >= 1 && n <= 7) set.add(n);
    }
    return [...set].sort((a, b) => a - b);
  }

  private async mustOwnDevice(userId: string, deviceId: string) {
    const d = await this.devices.findOne({ where: { id: deviceId } });
    if (!d) throw new NotFoundException('device not found');
    if (!d.owner || d.owner.id !== userId) throw new ForbiddenException();
    return d;
  }

  private async mustOwnAlarm(userId: string, id: string) {
    const a = await this.alarms.findOne({
      where: { id },
      relations: ['owner', 'device'],
    });
    if (!a) throw new NotFoundException('alarm not found');
    if (!a.owner || a.owner.id !== userId) throw new NotFoundException('alarm not found');
    return a;
  }

  // ----- lists ---------------------------------------------------------------

  listAll(userId: string) {
    return this.alarms.find({
      where: { owner: { id: userId } },
      order: { hour: 'ASC', minute: 'ASC' },
      relations: ['device'],
    });
  }

  listByDevice(userId: string, deviceId: string) {
    return this.alarms.find({
      where: { owner: { id: userId }, sunrise: true, device: { id: deviceId } },
      order: { hour: 'ASC', minute: 'ASC' },
      relations: ['device'],
    });
  }

  // ----- create / update / delete -------------------------------------------

  async create(userId: string, dto: AlarmDto) {
    const owner = await this.users.findOne({ where: { id: userId } });
    if (!owner) throw new NotFoundException('user not found');

    const days = this.normalizeDays(dto.days);

    let device: Device | null = null;
    if (dto.sunrise) {
      if (!dto.deviceId) {
        throw new BadRequestException('deviceId required when sunrise=true');
      }
      device = await this.mustOwnDevice(userId, dto.deviceId);
    } else {
      device = null;
    }

    const a = this.alarms.create({
      owner,
      device,
      hour: dto.hour,
      minute: dto.minute,
      days,
      durationMinutes: dto.durationMinutes,
      enabled: dto.enabled,
      sunrise: dto.sunrise,
      label: dto.label ?? null,
    });

    return this.alarms.save(a);
  }

  async update(userId: string, id: string, dto: Partial<AlarmDto>) {
    const a = await this.mustOwnAlarm(userId, id);

    if (dto.hour !== undefined) a.hour = dto.hour;
    if (dto.minute !== undefined) a.minute = dto.minute;
    if (dto.days !== undefined) a.days = this.normalizeDays(dto.days);
    if (dto.durationMinutes !== undefined) a.durationMinutes = dto.durationMinutes;
    if (dto.enabled !== undefined) a.enabled = dto.enabled;
    if (dto.label !== undefined) a.label = dto.label ?? null;
    if (dto.sunrise !== undefined) a.sunrise = dto.sunrise;

    if (a.sunrise) {
      const targetDeviceId = dto.deviceId ?? a.device?.id;
      if (!targetDeviceId) {
        throw new BadRequestException('deviceId required when sunrise=true');
      }
      if (!a.device || a.device.id !== targetDeviceId) {
        a.device = await this.mustOwnDevice(userId, targetDeviceId);
      }
    } else {
      a.device = null;
    }

    return this.alarms.save(a);
  }

  async remove(userId: string, id: string) {
    const a = await this.mustOwnAlarm(userId, id);
    await this.alarms.delete(a.id);
    return { ok: true };
  }

  async markTriggered(userId: string, id: string) {
    const a = await this.mustOwnAlarm(userId, id);
    a.lastTriggeredAt = new Date();

    if (!a.days || a.days.length === 0) {
      a.enabled = false;
    }

    return this.alarms.save(a);
  }
}
