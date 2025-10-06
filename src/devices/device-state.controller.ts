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
}
