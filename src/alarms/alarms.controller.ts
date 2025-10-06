import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/alarms')
export class AlarmsController {
  constructor(private readonly svc: AlarmsService) {}

  @Get()
  list(@Req() req: any, @Param('deviceId') deviceId: string) {
    return this.svc.list(deviceId);
  }

  @Post()
  create(@Req() req: any, @Param('deviceId') deviceId: string, @Body() dto: {
    hour: number; minute: number; days: number[]; durationMinutes: number; enabled: boolean
  }) {
    return this.svc.create(deviceId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove(id);
  }
}
