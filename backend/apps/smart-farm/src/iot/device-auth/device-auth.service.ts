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
  ) {}

  /**
   * Qurilma uchun yangi API key generatsiya qilish.
   * Avval mavjud key bo'lsa o'chirib, yangi yaratadi.
   */
  async generateApiKey(
    input: GenerateDeviceApiKeyInput,
  ): Promise<IDeviceApiKey> {
    // Avvalgi keyni o'chirish
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

  /**
   * MQTT Broker yoki HTTP so'rov kelganda API keyni tekshiradi.
   * Haqiqiy bo'lsa deviceId qaytaradi.
   */
  async validateApiKey(apiKey: string): Promise<Types.ObjectId> {
    const record = await this.apiKeyModel
      .findOne({ apiKey, isActive: true })
      .exec();

    if (!record) {
      throw new UnauthorizedException('Invalid device API key.');
    }

    // Muddati o'tgan
    if (record.expiresAt && record.expiresAt < new Date()) {
      await this.apiKeyModel.findByIdAndUpdate(record._id, { isActive: false });
      throw new UnauthorizedException('Device API key has expired.');
    }

    // lastUsedAt yangilash
    await this.apiKeyModel.findByIdAndUpdate(record._id, {
      lastUsedAt: new Date(),
    });

    return record.deviceId;
  }

  /**
   * API keyni bekor qilish (qurilma o'g'irlangan, almashtirish kerak)
   */
  async revokeApiKey(input: RevokeDeviceApiKeyInput): Promise<boolean> {
    const result = await this.apiKeyModel.updateOne(
      { deviceId: new Types.ObjectId(input.deviceId) },
      { isActive: false },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException('API key not found.');
    this.logger.warn(`API key revoked | deviceId=${input.deviceId}`);
    return true;
  }

  /**
   * Device API key ma'lumotini olish
   */
  async findByDevice(deviceId: string): Promise<IDeviceApiKey | null> {
    return this.apiKeyModel
      .findOne({ deviceId: new Types.ObjectId(deviceId) })
      .exec();
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private createApiKey(): string {
    // Format: sf_<32 hex chars> → "sf_a3f9d2c1..."
    return `sf_${randomBytes(16).toString('hex')}`;
  }
}
