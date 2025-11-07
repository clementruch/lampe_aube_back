import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DeviceStateService } from './device-state.service';
import { DeviceStateController } from './device-state.controller';
import { Device } from '../entities/device.entity';
import { User } from '../entities/user.entity';
import { DeviceState } from '../entities/device-state.entity';
import { Telemetry } from '../entities/telemetry.entity';
import { Alarm } from '../entities/alarm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, User, DeviceState, Telemetry, Alarm]),
  ],
  controllers: [DevicesController, DeviceStateController],
  providers: [DevicesService, DeviceStateService],
  exports: [DevicesService],
})
export class DevicesModule {}
