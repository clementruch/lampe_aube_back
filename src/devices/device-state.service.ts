import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import { DeviceState } from '../entities/device-state.entity';
import { Telemetry } from '../entities/telemetry.entity';

@Injectable()
export class DeviceStateService {
  constructor(
    @InjectRepository(Device) private devices: Repository<Device>,
    @InjectRepository(DeviceState) private states: Repository<DeviceState>,
    @InjectRepository(Telemetry) private telemetry: Repository<Telemetry>,
  ) {}

  private async ensureState(deviceId: string) {
    let st = await this.states.findOne({ where: { device: { id: deviceId } } });
    if (!st) {
      const dev = await this.devices.findOne({ where: { id: deviceId } });
      if (!dev) throw new NotFoundException('device not found');
      st = this.states.create({ device: dev });
      st = await this.states.save(st);
    }
    return st;
    }

  async getState(deviceId: string) {
    const st = await this.ensureState(deviceId);
    const latest = await this.telemetry.findOne({
      where: { device: { id: deviceId } },
      order: { createdAt: 'DESC' },
    });
    return {
      deviceId,
      power: st.power,
      brightness: st.brightness,
      colorTemp: st.colorTemp,
      lux: latest?.lux ?? 20,
      temp: latest?.temp ?? 22.0,
      updatedAt: st.updatedAt,
    };
  }

  async patchState(deviceId: string, dto: Partial<{ power: boolean; brightness: number; colorTemp: number }>) {
    const st = await this.ensureState(deviceId);
    if (typeof dto.power === 'boolean') st.power = dto.power;
    if (typeof dto.brightness === 'number') st.brightness = dto.brightness;
    if (typeof dto.colorTemp === 'number') st.colorTemp = dto.colorTemp;
    await this.states.save(st);
    return this.getState(deviceId);
  }

  async pushTelemetry(deviceId: string, payload: { lux: number; temp: number }) {
    const dev = await this.devices.findOne({ where: { id: deviceId } });
    if (!dev) throw new NotFoundException('device not found');
    const row = this.telemetry.create({ device: dev, lux: payload.lux, temp: payload.temp });
    await this.telemetry.save(row);
    return { ok: true, id: row.id, createdAt: row.createdAt };
  }

  async listTelemetry(deviceId: string, limit = 100) {
    return this.telemetry.find({
      where: { device: { id: deviceId } },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 1000),
    });
  }
}
