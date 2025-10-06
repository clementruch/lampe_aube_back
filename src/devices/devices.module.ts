import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { Device } from '../entities/device.entity';
import { User } from '../entities/user.entity';
import { DeviceState } from '../entities/device-state.entity';
import { Telemetry } from '../entities/telemetry.entity';
import { DeviceStateService } from './device-state.service';
import { DeviceStateController } from './device-state.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, User, DeviceState, Telemetry]),
    AuthModule,
  ],
  controllers: [DevicesController, DeviceStateController],
  providers: [DevicesService, DeviceStateService],
  exports: [DevicesService],
})
export class DevicesModule {}
