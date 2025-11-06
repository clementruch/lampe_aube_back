import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from '../entities/alarm.entity';
import { Device } from '../entities/device.entity';
import { User } from '../entities/user.entity';
import { AlarmsService } from './alarms.service';
import { AlarmsController as AlarmsDeviceController } from './alarms.device.controller';
import { AlarmsGlobalController } from './alarms.global.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm, Device, User])],
  controllers: [AlarmsDeviceController, AlarmsGlobalController],
  providers: [AlarmsService],
  exports: [AlarmsService],
})
export class AlarmsModule {}
