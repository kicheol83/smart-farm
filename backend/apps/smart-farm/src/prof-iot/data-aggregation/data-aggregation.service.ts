import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

interface IRawSensorData extends Document {
  sensorId: Types.ObjectId;
  sensorDataValue: number;
  recordedAt: Date;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
}

interface IAggregated extends Document {
  sensorId: Types.ObjectId;
  sensorType: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  avgValue: number;
  minValue: number;
  maxValue: number;
  count: number;
}

@Injectable()
export class DataAggregationService {
  private readonly logger = new Logger(DataAggregationService.name);

  constructor(
    @InjectModel('sensor_data')
    private readonly rawModel: Model<IRawSensorData>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('aggregatedSensorData')
    private readonly aggModel: Model<IAggregated>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async aggregateHourly(): Promise<void> {
    const now = new Date();
    const to = new Date(now);
    to.setMinutes(0, 0, 0);

    const from = new Date(to);
    from.setHours(from.getHours() - 1);

    this.logger.log(
      `Hourly aggregation | ${from.toISOString()} → ${to.toISOString()}`,
    );

    await this.aggregate('HOURLY', from, to);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const deleted = await this.rawModel.deleteMany({
      recordedAt: { $lt: cutoff },
    });

    if (deleted.deletedCount > 0) {
      this.logger.log(
        `Raw data cleaned | ${deleted.deletedCount} records deleted (older than 7 days)`,
      );
    }
  }

  @Cron('0 0 * * *')
 public async aggregateDaily(): Promise<void> {
    const now = new Date();
    const to = new Date(now);
    to.setHours(0, 0, 0, 0);

    const from = new Date(to);
    from.setDate(from.getDate() - 1);

    this.logger.log(
      `Daily aggregation | ${from.toISOString()} → ${to.toISOString()}`,
    );

    await this.aggregate('DAILY', from, to);

    // Hourly aggregate: 30 kundan eski bo'lsa o'chir
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    await this.aggModel.deleteMany({
      period: 'HOURLY',
      periodStart: { $lt: cutoff },
    });
  }

  @Cron('0 1 1 * *')
 public async aggregateMonthly(): Promise<void> {
    const now = new Date();
    const to = new Date(now.getFullYear(), now.getMonth(), 1);
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    this.logger.log(
      `Monthly aggregation | ${from.toISOString()} → ${to.toISOString()}`,
    );

    await this.aggregate('MONTHLY', from, to);
  }

 public async getAggregated(
    sensorId: string,
    period: 'HOURLY' | 'DAILY' | 'MONTHLY',
    from: Date,
    to: Date,
  ) {
    const count = await this.aggModel.countDocuments();
    console.log('Aggregation count:', count);
    const result = await this.aggModel
      .find({
        sensorId: new Types.ObjectId(sensorId),
        period,
        periodStart: { $gte: from, $lte: to },
      })
      .sort({ periodStart: 1 })
      .exec();
    console.log('getAggregated result:', result); // Debugging log
    return result;
  }

  private async aggregate(
    period: 'HOURLY' | 'DAILY' | 'MONTHLY',
    from: Date,
    to: Date,
  ): Promise<void> {
    const sensors = await this.sensorModel
      .find()
      .select('_id sensorType')
      .exec();

    let aggregated = 0;

    for (const sensor of sensors) {
      const result = await this.rawModel.aggregate([
        {
          $match: {
            sensorId: sensor._id,
            recordedAt: { $gte: from, $lt: to },
          },
        },
        {
          $group: {
            _id: null,
            avg: { $avg: '$sensorDataValue' },
            min: { $min: '$sensorDataValue' },
            max: { $max: '$sensorDataValue' },
            count: { $sum: 1 },
          },
        },
      ]);

      if (!result.length || result[0].count === 0) continue;

      const { avg, min, max, count } = result[0];

      await this.aggModel.findOneAndUpdate(
        {
          sensorId: sensor._id,
          period,
          periodStart: from,
        },
        {
          sensorId: sensor._id,
          sensorType: sensor.sensorType,
          period,
          periodStart: from,
          periodEnd: to,
          avgValue: Math.round(avg * 100) / 100,
          minValue: Math.round(min * 100) / 100,
          maxValue: Math.round(max * 100) / 100,
          count,
        },
        { upsert: true },
      );

      aggregated++;
    }

    this.logger.log(
      `${period} aggregation done | ${aggregated} sensors | period=${from.toISOString()}`,
    );
  }
}
