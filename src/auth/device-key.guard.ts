import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DeviceKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(Device) private readonly devices: Repository<Device>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const deviceId: string = req.params.deviceId;
    const key = req.header('x-device-key') || req.header('X-Device-Key');
    if (!deviceId || !key) throw new UnauthorizedException('Missing device key');

    const dev = await this.devices.findOne({ where: { id: deviceId } });
    if (!dev || !dev.apiKey || dev.apiKey !== key) {
      throw new UnauthorizedException('Invalid device key');
    }
    req.device = dev;
    return true;
  }
}
