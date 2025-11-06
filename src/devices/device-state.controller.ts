import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DeviceStateService } from './device-state.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevicesService } from './devices.service';

@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId')
export class DeviceStateController {
  constructor(
    private readonly svc: DeviceStateService,
    private readonly devicesSvc: DevicesService,
  ) {}

  private async assertOwner(req: any, deviceId: string) {
    const list = await this.devicesSvc.listByUser(req.user.sub);
    if (!list.find((d) => d.id === deviceId)) {
      throw new Error('not your device');
    }
  }

  @Get('state')
  async getState(@Req() req: any, @Param('deviceId') deviceId: string) {
    await this.assertOwner(req, deviceId);
    return this.svc.getState(deviceId);
  }

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

  @Get('telemetry')
  async listTelemetry(
    @Req() req: any,
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: string,
  ) {
    await this.assertOwner(req, deviceId);
    return this.svc.listTelemetry(deviceId, limit ? parseInt(limit, 10) : 100);
  }

  @Patch('sunrise')
  async setSunrise(
    @Req() req: any,
    @Param('deviceId') deviceId: string,
    @Body() body: { at?: string | null; duration?: number },
  ) {
    await this.assertOwner(req, deviceId);

    // Cas 1 : annuler la planif
    if (!body || !body.at) {
      await this.svc.clearScheduledSunrise(deviceId);
      return { ok: true, cleared: true };
    }

    // Cas 2 : planifier une aube
    const at = new Date(body.at);
    const duration = body.duration ?? 15;
    return this.svc.scheduleSunrise(deviceId, at, duration);
  }
}
