import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CalibrationResult,
  SetCalibrationInput,
} from '../../libs/dto/mid-iot/calibration';

interface ICalibration extends Document {
  _id: Types.ObjectId;
  sensorId: Types.ObjectId;
  offset: number;
  scaleFactor: number;
  description: string;
  calibratedAt: Date;
  calibratedBy: Types.ObjectId;
  isActive: boolean;
  history: any[];
}

@Injectable()
export class CalibrationService {
  private readonly logger = new Logger(CalibrationService.name);

  private readonly cache = new Map<string, { offset: number; scale: number }>();

  constructor(
    @InjectModel('sensorCalibrations')
    private readonly calibModel: Model<ICalibration>,
  ) {}

 public async apply(sensorId: string, rawValue: number): Promise<number> {
    let params = this.cache.get(sensorId);

    if (!params) {
      const calib = await this.calibModel
        .findOne({ sensorId: new Types.ObjectId(sensorId), isActive: true })
        .lean()
        .exec();

      if (!calib) return rawValue;

      params = { offset: calib.offset, scale: calib.scaleFactor };
      this.cache.set(sensorId, params);
    }

    const calibrated = (rawValue + params.offset) * params.scale;
    return Math.round(calibrated * 100) / 100;
  }

 public async setCalibration(
    input: SetCalibrationInput,
    memberId: string,
  ): Promise<ICalibration> {
    const existing = await this.calibModel
      .findOne({ sensorId: new Types.ObjectId(input.sensorId) })
      .exec();

    let result: ICalibration;

    if (existing) {
      const historyEntry = {
        offset: existing.offset,
        scaleFactor: existing.scaleFactor,
        appliedAt: existing.calibratedAt,
        appliedBy: existing.calibratedBy,
      };

      result = (await this.calibModel
        .findOneAndUpdate(
          { sensorId: new Types.ObjectId(input.sensorId) },
          {
            offset: input.offset,
            scaleFactor: input.scaleFactor,
            description: input.description,
            calibratedAt: new Date(),
            calibratedBy: new Types.ObjectId(memberId),
            isActive: true,
            $push: { history: historyEntry },
          },
          { new: true },
        )
        .exec()) as ICalibration;
    } else {
      result = await this.calibModel.create({
        sensorId: new Types.ObjectId(input.sensorId),
        offset: input.offset,
        scaleFactor: input.scaleFactor,
        description: input.description,
        calibratedAt: new Date(),
        calibratedBy: new Types.ObjectId(memberId),
      });
    }

    this.cache.set(input.sensorId, {
      offset: input.offset,
      scale: input.scaleFactor,
    });

    this.logger.log(
      `Calibration set | sensor=${input.sensorId} ` +
        `| offset=${input.offset} | scale=${input.scaleFactor}`,
    );

    return result;
  }

 public async preview(
    sensorId: string,
    rawValue: number,
  ): Promise<CalibrationResult> {
    const calibrated = await this.apply(sensorId, rawValue);
    return {
      rawValue,
      calibratedValue: calibrated,
      delta: Math.round((calibrated - rawValue) * 100) / 100,
    };
  }

 public async disable(sensorId: string): Promise<void> {
    await this.calibModel.findOneAndUpdate(
      { sensorId: new Types.ObjectId(sensorId) },
      { isActive: false },
    );
    this.cache.delete(sensorId);
    this.logger.log(`Calibration disabled | sensor=${sensorId}`);
  }

  public async findBySensor(sensorId: string): Promise<ICalibration | null> {
    return this.calibModel
      .findOne({ sensorId: new Types.ObjectId(sensorId) })
      .exec();
  }
}
