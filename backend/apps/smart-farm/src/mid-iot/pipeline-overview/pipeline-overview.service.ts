import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PipelineOverview } from '../../libs/dto/mid-iot/pipeline-overview';

const HOUR = 3600000;

type HourBucket = { _id: Date; count: number };

@Injectable()
export class PipelineOverviewService {
  constructor(
    @InjectModel('devices') private readonly deviceModel: Model<any>,
    @InjectModel('sensors') private readonly sensorModel: Model<any>,
    @InjectModel('sensor_data') private readonly sensorDataModel: Model<any>,
    @InjectModel('sensorStats') private readonly statsModel: Model<any>,
    @InjectModel('anomalyLogs') private readonly anomalyModel: Model<any>,
    @InjectModel('systemErrorLogs') private readonly errorModel: Model<any>,
  ) {}

  async getOverview(greenHouseId: string): Promise<PipelineOverview> {
    const greenhouse = new Types.ObjectId(greenHouseId);
    const now = Date.now();
    const since24h = new Date(now - 24 * HOUR);
    const sinceHour = new Date(now - HOUR);
    const firstHour = new Date(Math.floor((now - 23 * HOUR) / HOUR) * HOUR);

    const devices = await this.deviceModel
      .find({ greenHouseId: greenhouse })
      .select('deviceName deviceStatus updatedAt')
      .lean<any[]>()
      .exec();
    const deviceIds = devices.map((d) => d._id);
    const deviceNames = new Map(devices.map((d) => [String(d._id), d.deviceName]));

    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds } })
      .select('sensorType sensorsUnit deviceId')
      .lean<any[]>()
      .exec();
    const sensorIds = sensors.map((s) => s._id);

    const [
      readingsLast24h,
      readingsLastHour,
      anomaliesLast24h,
      errorsLast24h,
      readingBuckets,
      anomalyBuckets,
      stats,
      lastReadings,
      anomaliesPerSensor,
      recentAnomalies,
    ] = await Promise.all([
      this.sensorDataModel.countDocuments({ sensorId: { $in: sensorIds }, recordedAt: { $gte: since24h } }),
      this.sensorDataModel.countDocuments({ sensorId: { $in: sensorIds }, recordedAt: { $gte: sinceHour } }),
      this.anomalyModel.countDocuments({ greenHouseId: greenhouse, detectedAt: { $gte: since24h } }),
      this.errorModel.countDocuments({
        deviceId: { $in: deviceIds.map((id) => String(id)) },
        createdAt: { $gte: since24h },
      }),
      this.sensorDataModel.aggregate<HourBucket>([
        { $match: { sensorId: { $in: sensorIds }, recordedAt: { $gte: firstHour } } },
        { $group: { _id: { $dateTrunc: { date: '$recordedAt', unit: 'hour' } }, count: { $sum: 1 } } },
      ]),
      this.anomalyModel.aggregate<HourBucket>([
        { $match: { greenHouseId: greenhouse, detectedAt: { $gte: firstHour } } },
        { $group: { _id: { $dateTrunc: { date: '$detectedAt', unit: 'hour' } }, count: { $sum: 1 } } },
      ]),
      this.statsModel.find({ sensorId: { $in: sensorIds } }).lean<any[]>().exec(),
      this.sensorDataModel.aggregate<{ _id: Types.ObjectId; value: number; at: Date }>([
        { $match: { sensorId: { $in: sensorIds }, recordedAt: { $gte: new Date(now - 7 * 24 * HOUR) } } },
        { $sort: { recordedAt: -1 } },
        { $group: { _id: '$sensorId', value: { $first: '$sensorDataValue' }, at: { $first: '$recordedAt' } } },
      ]),
      this.anomalyModel.aggregate<{ _id: Types.ObjectId; count: number }>([
        { $match: { greenHouseId: greenhouse, detectedAt: { $gte: since24h } } },
        { $group: { _id: '$sensorId', count: { $sum: 1 } } },
      ]),
      this.anomalyModel
        .find({ greenHouseId: greenhouse })
        .sort({ detectedAt: -1 })
        .limit(15)
        .lean<any[]>()
        .exec(),
    ]);

    const readingsByHour = new Map(readingBuckets.map((b) => [new Date(b._id).getTime(), b.count]));
    const anomaliesByHour = new Map(anomalyBuckets.map((b) => [new Date(b._id).getTime(), b.count]));
    const throughput = Array.from({ length: 24 }, (_, index) => {
      const hour = firstHour.getTime() + index * HOUR;
      return {
        hour: new Date(hour),
        readings: readingsByHour.get(hour) ?? 0,
        anomalies: anomaliesByHour.get(hour) ?? 0,
      };
    });

    const statsBySensor = new Map(stats.map((s) => [String(s.sensorId), s]));
    const lastBySensor = new Map(lastReadings.map((r) => [String(r._id), r]));
    const anomalyCountBySensor = new Map(anomaliesPerSensor.map((a) => [String(a._id), a.count]));
    const sensorCountByDevice = new Map<string, number>();
    for (const sensor of sensors) {
      const key = String(sensor.deviceId);
      sensorCountByDevice.set(key, (sensorCountByDevice.get(key) ?? 0) + 1);
    }

    return {
      greenHouseId,
      readingsLast24h,
      readingsLastHour,
      anomaliesLast24h,
      errorsLast24h,
      throughput,
      sensors: sensors.map((sensor) => {
        const id = String(sensor._id);
        const stat = statsBySensor.get(id);
        const last = lastBySensor.get(id);
        return {
          sensorId: id,
          sensorType: sensor.sensorType,
          unit: sensor.sensorsUnit,
          deviceName: deviceNames.get(String(sensor.deviceId)) ?? '',
          mean: stat?.mean,
          std: stat?.std,
          sampleSize: stat?.sampleSize ?? 0,
          lastValue: last?.value,
          lastReadingAt: last?.at,
          anomaliesLast24h: anomalyCountBySensor.get(id) ?? 0,
        };
      }),
      devices: devices.map((device) => ({
        deviceId: String(device._id),
        deviceName: device.deviceName,
        deviceStatus: device.deviceStatus ?? 'UNKNOWN',
        lastSeenAt: device.updatedAt,
        sensorCount: sensorCountByDevice.get(String(device._id)) ?? 0,
      })),
      recentAnomalies: recentAnomalies.map((anomaly) => ({
        ...anomaly,
        _id: String(anomaly._id),
        sensorId: String(anomaly.sensorId),
      })),
    };
  }
}
