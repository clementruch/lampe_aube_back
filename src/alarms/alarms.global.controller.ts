import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AlarmDto = {
  hour: number;
  minute: number;
  days: number[];
  durationMinutes: number;
  enabled: boolean;
  sunrise: boolean;
  label?: string | null;
  deviceId?: string | null;
};

@UseGuards(JwtAuthGuard)
@Controller('alarms')
export class AlarmsGlobalController {
  constructor(private readonly svc: AlarmsService) {}

  @Get()
  list(@Req() req: any, @Query('deviceId') deviceId?: string) {
    return deviceId
      ? this.svc.listByDevice(req.user.sub, deviceId)
      : this.svc.listAll(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() dto: AlarmDto) {
    return this.svc.create(req.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<AlarmDto>,
  ) {
    return this.svc.update(req.user.sub, id, dto);
  }

  @Patch(':id/triggered')
  markTriggered(@Req() req: any, @Param('id') id: string) {
    return this.svc.markTriggered(req.user.sub, id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove(req.user.sub, id);
  }
}
