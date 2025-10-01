import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from '../entities/alarm.entity';
import { Device } from '../entities/device.entity';
import { AlarmsService } from './alarms.service';
import { AlarmsController } from './alarms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm, Device])],
  controllers: [AlarmsController],
  providers: [AlarmsService],
})
export class AlarmsModule {}
