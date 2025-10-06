import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class DeviceKeyGuard implements CanActivate {
  constructor(private readonly devices: DevicesService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['x-device-key'] as string | undefined;
    const deviceId = req.params.deviceId as string | undefined;
    if (!key || !deviceId) throw new UnauthorizedException('Missing device key');

    const dev = await this.devices.findById(deviceId);
    if (!dev || dev.apiKey !== key) throw new UnauthorizedException('Bad device key');

    req.device = dev;
    return true;
  }
}
