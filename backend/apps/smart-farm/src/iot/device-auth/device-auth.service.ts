import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { randomBytes } from 'crypto';
import {
  GenerateDeviceApiKeyInput,
  RevokeDeviceApiKeyInput,
} from '../../libs/dto/device.auth.dto';
import { IDevice } from '../../io-tcontext-module/devices/devices.service';

export interface IDeviceApiKey extends Document {
  _id: Types.ObjectId;
  apiKey: string;
  deviceId: Types.ObjectId;
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DeviceAuthService {
  private readonly logger = new Logger(DeviceAuthService.name);

  constructor(
    @InjectModel('deviceApiKeys')
    private readonly apiKeyModel: Model<IDeviceApiKey>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,
  ) {}

  public async generateApiKey(
    input: GenerateDeviceApiKeyInput,
  ): Promise<IDeviceApiKey> {
    if (!Types.ObjectId.isValid(input.deviceId)) {
      throw new ConflictException('Invalid deviceId.');
    }
    const device = await this.deviceModel.findById(input.deviceId).exec();
    if (!device) {
      throw new NotFoundException('Device not found.');
    }
    await this.apiKeyModel.deleteOne({
      deviceId: new Types.ObjectId(input.deviceId),
    });

    const apiKey = this.createApiKey();

    const record = await this.apiKeyModel.create({
      apiKey,
      deviceId: new Types.ObjectId(input.deviceId),
      isActive: true,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });

    this.logger.log(`API key generated | deviceId=${input.deviceId}`);
    return record;
  }

  public async validateApiKey(apiKey: string): Promise<Types.ObjectId> {
    const record = await this.apiKeyModel
      .findOne({ apiKey, isActive: true })
      .exec();

    if (!record) {
      throw new UnauthorizedException('Invalid device API key.');
    }

    if (record.expiresAt && record.expiresAt < new Date()) {
      await this.apiKeyModel.findByIdAndUpdate(record._id, { isActive: false });
      throw new UnauthorizedException('Device API key has expired.');
    }

    await this.apiKeyModel.findByIdAndUpdate(record._id, {
      lastUsedAt: new Date(),
    });

    return record.deviceId;
  }

  public async revokeApiKey(input: RevokeDeviceApiKeyInput): Promise<boolean> {
    const result = await this.apiKeyModel.updateOne(
      { deviceId: new Types.ObjectId(input.deviceId) },
      { isActive: false },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException('API key not found.');
    this.logger.warn(`API key revoked | deviceId=${input.deviceId}`);
    return true;
  }

  public async findByDevice(deviceId: string): Promise<IDeviceApiKey | null> {
    return this.apiKeyModel
      .findOne({ deviceId: new Types.ObjectId(deviceId) })
      .exec();
  }

  private createApiKey(): string {
    return `sf_${randomBytes(16).toString('hex')}`;
  }
}
