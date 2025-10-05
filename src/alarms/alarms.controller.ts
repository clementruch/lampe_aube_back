import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/alarms')
export class AlarmsController {
  constructor(private readonly svc: AlarmsService) {}

  @Get()
  list(@Param('deviceId') deviceId: string) {
    return this.svc.list(deviceId);
  }
  @Post()
  create(@Param('deviceId') deviceId: string, @Body() dto: any) {
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
