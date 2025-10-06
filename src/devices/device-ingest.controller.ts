import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DeviceStateService } from './device-state.service';
import { DeviceKeyGuard } from '../auth/device-key.guard';

@UseGuards(DeviceKeyGuard)
@Controller('devices/:deviceId')
export class DeviceIngestController {
  constructor(private readonly svc: DeviceStateService) {}

  @Get('desired')
  getDesired(@Param('deviceId') deviceId: string) {
    return this.svc.getState(deviceId);
  }

  @Post('telemetry')
  pushTelemetry(
    @Param('deviceId') deviceId: string,
    @Body() payload: { lux: number; temp: number },
  ) {
    return this.svc.pushTelemetry(deviceId, payload);
  }
}
