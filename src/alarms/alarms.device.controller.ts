import {
  Body,
  Controller,
  Patch,
  Param,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeviceKeyGuard } from '../auth/device-key.guard';

@UseGuards(JwtAuthGuard)
@Controller('alarms')
export class AlarmsController {
  constructor(private readonly svc: AlarmsService) {}

  @Patch(':id/triggered')
  async markTriggered(@Req() req: any, @Param('id') id: string) {
    return this.svc.markTriggered(req.user.sub, id);
  }
}

@UseGuards(DeviceKeyGuard)
@Controller('devices/:deviceId/alarms')
export class DeviceAlarmsRuntimeController {
  constructor(private readonly svc: AlarmsService) {}

  @Patch(':id/triggered')
  async deviceTriggered(@Req() req: any, @Param('id') id: string) {
    const alarm = await this.svc['alarms'].findOne({
      where: { id },
      relations: ['owner', 'device'],
    });
    if (!alarm || !alarm.device || alarm.device.id !== req.device.id) throw new NotFoundException('alarm not found');
    alarm.lastTriggeredAt = new Date();
    if (!alarm.days || alarm.days.length === 0) alarm.enabled = false;
    return this.svc['alarms'].save(alarm);
  }
}
