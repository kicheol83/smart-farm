import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import {
  TimeSeriesDataPoint,
  TimeSeriesGranularity,
} from '../../libs/dto/mid-iot/timeseries';

@Injectable()
export class TimeseriesService implements OnModuleInit {
  private readonly logger = new Logger(TimeseriesService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel('timeSeriesSensorData')
    private readonly tsModel: Model<any>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureTimeSeriesCollection();
  }

  private async ensureTimeSeriesCollection(): Promise<void> {
    const db = this.connection.db;
    if (!db) return;

    const collections = await db
      .listCollections({ name: 'timeSeriesSensorData' })
      .toArray();

    if (collections.length === 0) {
      await db.createCollection('timeSeriesSensorData', {
        timeseries: {
          timeField: 'timestamp',
          metaField: 'metadata',
          granularity: 'seconds',
        },
        expireAfterSeconds: 90 * 24 * 60 * 60, // 90 kun
      });
      this.logger.log('Time-series collection created');
    }
  }

  async insert(
    sensorId: string,
    sensorType: string,
    deviceId: string,
    unit: string,
    value: number,
    timestamp: Date,
  ): Promise<void> {
    await this.tsModel.create({
      timestamp,
      metadata: {
        sensorId: new Types.ObjectId(sensorId),
        sensorType,
        deviceId: new Types.ObjectId(deviceId),
        unit,
      },
      value,
    });
  }

 public async query(
    sensorId: string,
    from: Date,
    to: Date,
    granularity: TimeSeriesGranularity,
  ): Promise<TimeSeriesDataPoint[]> {
    const groupId = this.buildGroupId(granularity);

    const result = await this.tsModel.aggregate([
      {
        $match: {
          'metadata.sensorId': new Types.ObjectId(sensorId),
          timestamp: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: groupId,
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          count: { $sum: 1 },
          timestamp: { $first: '$timestamp' },
        },
      },
      { $sort: { timestamp: 1 } },
    ]);

    return result.map((r) => ({
      timestamp: r.timestamp,
      value: Math.round(r.avgValue * 100) / 100,
      avgValue: Math.round(r.avgValue * 100) / 100,
      minValue: Math.round(r.minValue * 100) / 100,
      maxValue: Math.round(r.maxValue * 100) / 100,
    }));
  }

 public async getLatest(
    sensorId: string,
    limit = 100,
  ): Promise<TimeSeriesDataPoint[]> {
    const result = await this.tsModel
      .find({ 'metadata.sensorId': new Types.ObjectId(sensorId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();

    return result
      .reverse()
      .map((r: any) => ({ timestamp: r.timestamp, value: r.value }));
  }

  private buildGroupId(granularity: TimeSeriesGranularity) {
    switch (granularity) {
      case TimeSeriesGranularity.MINUTE:
        return {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' },
          minute: { $minute: '$timestamp' },
        };
      case TimeSeriesGranularity.HOUR:
        return {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' },
        };
      case TimeSeriesGranularity.DAY:
        return {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
        };
    }
  }
}
