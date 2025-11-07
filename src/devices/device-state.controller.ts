import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { DeviceStateService } from './device-state.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevicesService } from './devices.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Alarm } from '../entities/alarm.entity';
import { Repository } from 'typeorm';
import { DeviceKeyGuard } from 'src/auth/device-key.guard';

@Controller('devices/:deviceId')
export class DeviceStateController {
  constructor(
    private readonly svc: DeviceStateService,
    private readonly devicesSvc: DevicesService,
    @InjectRepository(Alarm) private readonly alarms: Repository<Alarm>,
  ) {}

  private async assertOwner(req: any, deviceId: string) {
    const list = await this.devicesSvc.listByUser(req.user.sub);
    if (!list.find((d) => d.id === deviceId)) {
      throw new Error('not your device');
    }
  }

  private computeNextOccurrence(a: Alarm): Date | null {
    if (!a.enabled) return null;
    const now = new Date();
    const daysSet = new Set<number>((a.days ?? []).map((x: any) => Number(x)));

    for (let add = 0; add < 14; add++) {
      const d = new Date(now);
      d.setDate(now.getDate() + add);

      // JS Date: 0=Sun..6=Sat → 1..7
      const jsDow = d.getDay();
      const ourDow = jsDow === 0 ? 7 : jsDow;

      if (daysSet.size > 0 && !daysSet.has(ourDow)) continue;

      const candidate = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        a.hour,
        a.minute,
        0,
        0,
      );
      if (candidate.getTime() > now.getTime()) return candidate;
    }
    return null;
  }

  @UseGuards(DeviceKeyGuard)
  @Get('desired')
  async desiredForDevice(@Param('deviceId') deviceId: string) {
    const st = await this.svc.getState(deviceId);

    const deviceAlarms = await this.alarms.find({
      where: { device: { id: deviceId } },
      order: { hour: 'ASC', minute: 'ASC' },
    });

    let next: { when: Date | null; dur: number } = { when: null, dur: 0 };
    for (const a of deviceAlarms) {
      const when = this.computeNextOccurrence(a);
      if (!when) continue;
      if (!next.when || when.getTime() < next.when.getTime()) {
        next = { when, dur: a.durationMinutes ?? 15 };
      }
    }

    return {
      power: st.power,
      brightness: st.brightness,
      colorTemp: st.colorTemp,
      sunriseAt: next.when ? next.when.toISOString() : null, // ISO UTC
      sunriseDuration: next.dur, // minutes
    };
  }

  @UseGuards(DeviceKeyGuard)
  @Post('telemetry')
  async pushTelemetryForDevice(
    @Param('deviceId') deviceId: string,
    @Body() body: { lux?: number; temp?: number },
  ) {
    await this.svc.addTelemetry(deviceId, {
      lux: body.lux ?? null,
      temp: body.temp ?? null,
    });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('desired')
  async desiredForApp(@Req() req: any, @Param('deviceId') deviceId: string) {
    await this.assertOwner(req, deviceId);
    const st = await this.svc.getState(deviceId);

    const deviceAlarms = await this.alarms.find({
      where: { device: { id: deviceId } },
      order: { hour: 'ASC', minute: 'ASC' },
    });

    let next: { when: Date | null; dur: number } = { when: null, dur: 0 };
    for (const a of deviceAlarms) {
      const when = this.computeNextOccurrence(a);
      if (!when) continue;
      if (!next.when || when.getTime() < next.when.getTime()) {
        next = { when, dur: a.durationMinutes ?? 15 };
      }
    }

    return {
      power: st.power,
      brightness: st.brightness,
      colorTemp: st.colorTemp,
      sunriseAt: next.when ? next.when.toISOString() : null,
      sunriseDuration: next.dur,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('state')
  async getState(@Req() req: any, @Param('deviceId') deviceId: string) {
    await this.assertOwner(req, deviceId);
    return this.svc.getState(deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('state')
  async patchState(
    @Req() req: any,
    @Param('deviceId') deviceId: string,
    @Body()
    dto: Partial<{ power: boolean; brightness: number; colorTemp: number }>,
  ) {
    await this.assertOwner(req, deviceId);
    return this.svc.patchState(deviceId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('telemetry')
  async listTelemetry(
    @Req() req: any,
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: string,
  ) {
    await this.assertOwner(req, deviceId);
    return this.svc.listTelemetry(deviceId, limit ? parseInt(limit, 10) : 100);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sunrise')
  async setSunrise(
    @Req() req: any,
    @Param('deviceId') deviceId: string,
    @Body() body: { at?: string | null; duration?: number },
  ) {
    await this.assertOwner(req, deviceId);

    if (!body || !body.at) {
      await this.svc.clearScheduledSunrise(deviceId);
      return { ok: true, cleared: true };
    }
    const at = new Date(body.at);
    const duration = body.duration ?? 15;
    return this.svc.scheduleSunrise(deviceId, at, duration);
  }
}
