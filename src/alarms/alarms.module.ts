import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from '../entities/alarm.entity';
import { Device } from '../entities/device.entity';
import { AlarmsService } from './alarms.service';
import { AlarmsController } from './alarms.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm, Device]), AuthModule],
  controllers: [AlarmsController],
  providers: [AlarmsService],
})
export class AlarmsModule {}
