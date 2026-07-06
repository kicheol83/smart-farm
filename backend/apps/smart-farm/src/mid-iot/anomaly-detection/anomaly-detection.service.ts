import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  AnomalyDetectionResult,
  AnomalySeverity,
} from '../../libs/dto/mid-iot/anomaly-detection';

interface ISensorStats extends Document {
  sensorId: Types.ObjectId;
  mean: number;
  std: number;
  sampleSize: number;
  updatedAt: Date;
}

interface ISensorData extends Document {
  sensorDataValue: number;
  recordedAt: Date;
  sensorId: Types.ObjectId;
}

interface IAnomalyLog extends Document {
  _id: Types.ObjectId;
  sensorId: Types.ObjectId;
  sensorType: string;
  deviceId: Types.ObjectId;
  greenHouseId: Types.ObjectId;
  value: number;
  zScore: number;
  meanValue: number;
  stdValue: number;
  severity: string;
  resolvedAt?: Date;
  detectedAt: Date;
}

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  private readonly WARNING_THRESHOLD = 2.0;
  private readonly CRITICAL_THRESHOLD = 3.0;

  private readonly MIN_SAMPLE_SIZE = 30;

  constructor(
    @InjectModel('sensor_data')
    private readonly sensorDataModel: Model<ISensorData>,

    @InjectModel('sensorStats')
    private readonly statsModel: Model<ISensorStats>,

    @InjectModel('anomalyLogs')
    private readonly anomalyModel: Model<IAnomalyLog>,
  ) {}

  public async check(
    sensorId: string,
    sensorType: string,
    deviceId: string,
    greenHouseId: string,
    value: number,
  ): Promise<AnomalyDetectionResult> {
    const stats = await this.getOrComputeStats(sensorId);

    if (!stats || stats.sampleSize < this.MIN_SAMPLE_SIZE) {
      return { isAnomaly: false, zScore: 0, mean: 0, std: 0 };
    }

    const zScore = Math.abs((value - stats.mean) / stats.std);

    let severity: AnomalySeverity | undefined;
    if (zScore >= this.CRITICAL_THRESHOLD) {
      severity = AnomalySeverity.CRITICAL;
    } else if (zScore >= this.WARNING_THRESHOLD) {
      severity = AnomalySeverity.WARNING;
    }

    const isAnomaly = !!severity;

    if (isAnomaly && severity) {
      await this.anomalyModel.create({
        sensorId: new Types.ObjectId(sensorId),
        sensorType,
        deviceId: new Types.ObjectId(deviceId),
        greenHouseId: new Types.ObjectId(greenHouseId),
        value,
        zScore: Math.round(zScore * 100) / 100,
        meanValue: Math.round(stats.mean * 100) / 100,
        stdValue: Math.round(stats.std * 100) / 100,
        severity,
        detectedAt: new Date(),
      });

      this.logger.warn(
        `Anomaly detected | sensor=${sensorId} | type=${sensorType} ` +
          `| value=${value} | Z=${zScore.toFixed(2)} | severity=${severity}`,
      );
    }

    await this.updateStatsOnline(sensorId, value, stats);

    return {
      isAnomaly,
      zScore: Math.round(zScore * 100) / 100,
      severity,
      mean: Math.round(stats.mean * 100) / 100,
      std: Math.round(stats.std * 100) / 100,
    };
  }

  public async resolve(anomalyId: string): Promise<void> {
    await this.anomalyModel.findByIdAndUpdate(anomalyId, {
      resolvedAt: new Date(),
    });
  }

  public async findByGreenhouse(
    greenHouseId: string,
    limit = 50,
  ): Promise<IAnomalyLog[]> {
    return this.anomalyModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ detectedAt: -1 })
      .limit(limit)
      .exec();
  }

  private async getOrComputeStats(
    sensorId: string,
  ): Promise<ISensorStats | null> {
    const existing = await this.statsModel
      .findOne({ sensorId: new Types.ObjectId(sensorId) })
      .exec();

    if (existing) return existing;

    const samples = await this.sensorDataModel
      .find({ sensorId: new Types.ObjectId(sensorId) })
      .sort({ recordedAt: -1 })
      .limit(1000)
      .lean()
      .exec();

    if (samples.length < this.MIN_SAMPLE_SIZE) return null;

    const values = samples.map((s) => s.sensorDataValue);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance);

    if (std === 0) return null;

    return this.statsModel.create({
      sensorId: new Types.ObjectId(sensorId),
      mean,
      std,
      sampleSize: values.length,
      updatedAt: new Date(),
    });
  }

  private async updateStatsOnline(
    sensorId: string,
    newValue: number,
    current: ISensorStats,
  ): Promise<void> {
    const n = current.sampleSize + 1;
    const delta = newValue - current.mean;
    const newMean = current.mean + delta / n;
    const delta2 = newValue - newMean;
    const newM2 = current.std ** 2 * (current.sampleSize - 1) + delta * delta2;
    const newStd = Math.sqrt(newM2 / (n - 1));

    await this.statsModel.findOneAndUpdate(
      { sensorId: new Types.ObjectId(sensorId) },
      { mean: newMean, std: newStd, sampleSize: n, updatedAt: new Date() },
    );
  }
}
