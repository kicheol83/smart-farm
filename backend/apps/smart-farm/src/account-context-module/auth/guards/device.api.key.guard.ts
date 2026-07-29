import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { DeviceAuthService } from '../../../iot/device-auth/device-auth.service';

interface IDeviceForAuth extends Document {
  _id: any;
  deviceName: string;
}

@Injectable()
export class DeviceApiKeyGuard implements CanActivate {
  constructor(
    private readonly deviceAuthService: DeviceAuthService,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDeviceForAuth>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const apiKey: string | undefined = req?.headers?.['x-device-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('X-Device-Api-Key header topilmadi.');
    }

    const deviceId = await this.deviceAuthService.validateApiKey(apiKey);

    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) {
      throw new UnauthorizedException('Device topilmadi.');
    }

    req.device = device;

    return true;
  }
}
