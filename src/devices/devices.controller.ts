import { Body, Controller, Get, Patch, Post, Param, UseGuards, Req } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly svc: DevicesService) {}

  @Get()
  list(@Req() req: any) {
    return this.svc.listByUser(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() dto: { name: string }) {
    return this.svc.createForUser(req.user.sub, dto.name);
  }

  @Patch(':id/name')
  rename(@Req() req: any, @Param('id') id: string, @Body() dto: { name: string }) {
    return this.svc.rename(req.user.sub, id, dto.name);
  }

  @Patch(':id/targetLux')
  setTargetLux(@Req() req: any, @Param('id') id: string, @Body() dto: { value: number }) {
    return this.svc.setTargetLux(req.user.sub, id, dto.value);
  }
}
