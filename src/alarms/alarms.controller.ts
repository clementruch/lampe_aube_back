import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AlarmsService } from './alarms.service';

@Controller('devices/:deviceId/alarms')
export class AlarmsController {
  constructor(private readonly svc: AlarmsService) {}

  @Get()
  list(@Param('deviceId') deviceId: string) {
    return this.svc.list(deviceId);
  }

  @Post()
  create(
    @Param('deviceId') deviceId: string,
    @Body() dto: { hour: number; minute: number; days: number[]; durationMinutes: number; enabled: boolean },
  ) {
    return this.svc.create(deviceId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
