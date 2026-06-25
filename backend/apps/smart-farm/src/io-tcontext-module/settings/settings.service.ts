import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  UpdateGeneralSettingsInput,
  Language,
  TemperatureUnit,
  AreaUnit,
  WaterUnit,
  TimeFormat,
} from '../../libs/dto/account-context-dto/member-settings/settings';

export interface IGeneralSettings extends Document {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  language: string;
  timezone: string;
  units: {
    temperatureUnit: string;
    areaUnit: string;
    waterUnit: string;
    timeFormat: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_SETTINGS = {
  language: Language.EN,
  timezone: 'Asia/Tashkent',
  units: {
    temperatureUnit: TemperatureUnit.CELSIUS,
    areaUnit: AreaUnit.SQUARE_METER,
    waterUnit: WaterUnit.LITER,
    timeFormat: TimeFormat.FORMAT_24H,
  },
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel('generalSettings')
    private readonly settingsModel: Model<IGeneralSettings>,
  ) {}

  public async getOrCreate(
    memberId: Types.ObjectId,
  ): Promise<IGeneralSettings> {
    let settings = await this.settingsModel.findOne({ memberId }).exec();

    if (!settings) {
      settings = await this.settingsModel.create({
        memberId,
        ...DEFAULT_SETTINGS,
      });
      this.logger.log(`Default settings created | memberId=${memberId}`);
    }

    return settings;
  }

  public async update(
    memberId: Types.ObjectId,
    input: UpdateGeneralSettingsInput,
  ): Promise<IGeneralSettings> {
    const updateData: any = {};

    if (input.language) updateData.language = input.language;
    if (input.timezone) updateData.timezone = input.timezone;

    // Units — deep merge
    if (input.units) {
      const current = await this.getOrCreate(memberId);
      updateData.units = {
        temperatureUnit:
          input.units.temperatureUnit ?? current.units.temperatureUnit,
        areaUnit: input.units.areaUnit ?? current.units.areaUnit,
        waterUnit: input.units.waterUnit ?? current.units.waterUnit,
        timeFormat: input.units.timeFormat ?? current.units.timeFormat,
      };
    }

    const settings = await this.settingsModel
      .findOneAndUpdate(
        { memberId },
        { $set: updateData },
        { new: true, upsert: true },
      )
      .exec();

    this.logger.log(`Settings updated | memberId=${memberId}`);
    return settings!;
  }
}
