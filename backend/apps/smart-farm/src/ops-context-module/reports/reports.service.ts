import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  GetReportInput,
  SaveReportInput,
  FullGreenhouseReport,
  GreenhouseReportSummary,
  OverallPlantHealthReport,
  SoilMoistureTrendReport,
  WaterUsageReport,
  AlertsSummaryReport,
  SensorTrendChart,
  ReportPeriod,
} from '../../libs/dto/ops-context-dto/reports/report';
import { IPlantHealth } from '../../farm-context-module/plan-health/plan-health.service';
import { IWaterUsage } from '../../farm-context-module/water-usage/water-usage.service';

interface IGreenhouse extends Document {
  greenHouseName: string;
}
interface ISensorData extends Document {
  sensorDataValue: number;
  recordedAt: Date;
  sensorId: Types.ObjectId;
}
interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  sensorsUnit: string;
  deviceId: Types.ObjectId;
}
interface IDevice extends Document {
  _id: Types.ObjectId;
  greenHouseId: Types.ObjectId;
}
interface IAlert extends Document {
  alertsType: string;
  alertsSeverity: string;
  createdAt: Date;
  sensorsId: Types.ObjectId;
}
interface IReport extends Document {
  _id: Types.ObjectId;
  reportsType: string;
  generatedAt: Date;
  greenHousesId: Types.ObjectId;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,

    @InjectModel('sensor_data')
    private readonly sensorDataModel: Model<ISensorData>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('plantHealth')
    private readonly plantHealthModel: Model<IPlantHealth>,

    @InjectModel('waterUsages')
    private readonly waterUsageModel: Model<IWaterUsage>,

    @InjectModel('alerts')
    private readonly alertModel: Model<IAlert>,

    @InjectModel('reports')
    private readonly reportModel: Model<IReport>,
  ) {}


  async getFullReport(input: GetReportInput): Promise<FullGreenhouseReport> {
    const { from, to } = this.resolvePeriod(input);

    const greenhouse = await this.greenhouseModel
      .findById(input.greenHouseId)
      .exec();
    if (!greenhouse) throw new NotFoundException('Greenhouse not found.');
    const [
      summary,
      plantHealth,
      soilMoisture,
      waterUsage,
      alertsSummary,
      trendCharts,
    ] = await Promise.all([
      this.buildSummary(
        input.greenHouseId,
        greenhouse.greenHouseName,
        from,
        to,
      ),
      this.buildPlantHealth(from, to),
      this.buildSoilMoisture(input.greenHouseId, from, to),
      this.buildWaterUsage(input.greenHouseId, from, to),
      this.buildAlertsSummary(input.greenHouseId, from, to),
      this.buildTrendCharts(input.greenHouseId, from, to),
    ]);

    return {
      summary,
      plantHealth,
      soilMoisture,
      waterUsage,
      alertsSummary,
      trendCharts,
    };
  }

  async saveReport(input: SaveReportInput): Promise<IReport> {
    const report = await this.reportModel.create({
      reportsType: input.reportsType,
      generatedAt: new Date(),
      greenHousesId: new Types.ObjectId(input.greenHousesId),
    });
    this.logger.log(`Report saved | type=${input.reportsType}`);
    return report;
  }

  async findReports(greenHouseId: string): Promise<IReport[]> {
    return this.reportModel
      .find({ greenHousesId: new Types.ObjectId(greenHouseId) })
      .sort({ generatedAt: -1 })
      .exec();
  }

  private async buildSummary(
    greenHouseId: string,
    greenHouseName: string,
    from: Date,
    to: Date,
  ): Promise<GreenhouseReportSummary> {
    const sensorIds = await this.getSensorIds(greenHouseId);

    const avgResult = await this.sensorDataModel.aggregate([
      {
        $match: {
          sensorId: { $in: sensorIds },
          recordedAt: { $gte: from, $lte: to },
        },
      },
      {
        $lookup: {
          from: 'sensors',
          localField: 'sensorId',
          foreignField: '_id',
          as: 'sensor',
        },
      },
      { $unwind: '$sensor' },
      {
        $group: {
          _id: '$sensor.sensorType',
          avg: { $avg: '$sensorDataValue' },
        },
      },
    ]);

    const avgs: Record<string, number> = {};
    avgResult.forEach((r) => (avgs[r._id] = Math.round(r.avg * 10) / 10));

    const totalAlerts = await this.countAlerts(sensorIds, from, to);
    const unresolvedAlerts = totalAlerts;

    const waterResult = await this.waterUsageModel.aggregate([
      {
        $match: {
          greenHouseId: new Types.ObjectId(greenHouseId),
          recordedAt: { $gte: from, $lte: to },
        },
      },
      { $group: { _id: null, total: { $sum: '$waterAmount' } } },
    ]);

    const latestHealth = await this.plantHealthModel
      .findOne()
      .sort({ recordeAt: -1 })
      .exec();

    return {
      greenHouseId,
      greenHouseName,
      sensorAverages: {
        avgTemperature: avgs['TEMPERATURE'],
        avgHumidity: avgs['HUMIDITY'],
        avgPh: avgs['PH'],
        avgCo2: avgs['CO2'],
        avgSoilMoisture: avgs['SOIL_MOISTURE'],
        avgLight: avgs['LIGHT'],
      },
      totalAlerts,
      unresolvedAlerts,
      totalWaterUsage: waterResult[0]?.total ?? 0,
      plantHealthScore: latestHealth?.plantHealthIndex ?? 0,
      periodStart: from,
      periodEnd: to,
    };
  }

  private async buildPlantHealth(
    from: Date,
    to: Date,
  ): Promise<OverallPlantHealthReport> {
    const records = await this.plantHealthModel
      .find({ recordeAt: { $gte: from, $lte: to } })
      .sort({ recordeAt: 1 })
      .limit(100)
      .exec();

    const current = records.at(-1)?.plantHealthIndex ?? 0;
    const first = records.at(0)?.plantHealthIndex ?? 0;
    const changePercent =
      first > 0 ? Math.round(((current - first) / first) * 100 * 10) / 10 : 0;

    const status =
      current >= 80 ? 'good' : current >= 50 ? 'warning' : 'critical';

    return {
      currentHealthIndex: current,
      changePercent,
      status,
      trend: records.map((r) => ({
        date: r.recordeAt,
        healthIndex: r.plantHealthIndex,
        plantValue: r.plantValue,
      })),
    };
  }

  private async buildSoilMoisture(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<SoilMoistureTrendReport> {
    const sensorIds = await this.getSensorIdsByType(
      greenHouseId,
      'SOIL_MOISTURE',
    );

    const records = await this.sensorDataModel
      .find({
        sensorId: { $in: sensorIds },
        recordedAt: { $gte: from, $lte: to },
      })
      .sort({ recordedAt: 1 })
      .exec();

    const values = records.map((r) => r.sensorDataValue);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = values.length
      ? Math.round((total / values.length) * 10) / 10
      : 0;

    const periodLen = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodLen);
    const prevRecords = await this.sensorDataModel
      .find({
        sensorId: { $in: sensorIds },
        recordedAt: { $gte: prevFrom, $lte: from },
      })
      .exec();

    const prevValues = prevRecords.map((r) => r.sensorDataValue);
    const prevAvg = prevValues.length
      ? prevValues.reduce((a, b) => a + b, 0) / prevValues.length
      : 0;
    const changePercent =
      prevAvg > 0 ? Math.round(((avg - prevAvg) / prevAvg) * 100 * 10) / 10 : 0;

    return {
      average: avg,
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
      changePercent,
      dataPoints: records.map((r) => ({
        recordedAt: r.recordedAt,
        value: r.sensorDataValue,
      })),
    };
  }

  private async buildWaterUsage(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<WaterUsageReport> {
    const dailyResult = await this.waterUsageModel.aggregate([
      {
        $match: {
          greenHouseId: new Types.ObjectId(greenHouseId),
          recordedAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$recordedAt' } },
          amount: { $sum: '$waterAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalUsage = dailyResult.reduce((s, d) => s + d.amount, 0);
    const days = dailyResult.length || 1;
    const dailyAverage = Math.round((totalUsage / days) * 10) / 10;

    const periodLen = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodLen);
    const prevResult = await this.waterUsageModel.aggregate([
      {
        $match: {
          greenHouseId: new Types.ObjectId(greenHouseId),
          recordedAt: { $gte: prevFrom, $lte: from },
        },
      },
      { $group: { _id: null, total: { $sum: '$waterAmount' } } },
    ]);

    const prevTotal = prevResult[0]?.total ?? 0;
    const changePercent =
      prevTotal > 0
        ? Math.round(((totalUsage - prevTotal) / prevTotal) * 100 * 10) / 10
        : 0;

    return {
      totalUsage,
      dailyAverage,
      changePercent,
      dataPoints: dailyResult.map((d) => ({
        date: new Date(d._id),
        amount: Math.round(d.amount * 10) / 10,
      })),
    };
  }

  private async buildAlertsSummary(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<AlertsSummaryReport> {
    const sensorIds = await this.getSensorIds(greenHouseId);

    const alerts = await this.alertModel
      .find({
        sensorsId: { $in: sensorIds },
        createdAt: { $gte: from, $lte: to },
      })
      .exec();

    const critical = alerts.filter(
      (a) => a.alertsSeverity === 'CRITICAL',
    ).length;
    const warning = alerts.filter((a) => a.alertsSeverity === 'WARNING').length;
    const info = alerts.filter((a) => a.alertsSeverity === 'INFO').length;

    const grouped: Record<string, any> = {};
    for (const alert of alerts) {
      const key = `${alert.alertsType}_${alert.alertsSeverity}`;
      if (!grouped[key]) {
        grouped[key] = {
          alertsType: alert.alertsType,
          alertsSeverity: alert.alertsSeverity,
          count: 0,
          lastOccurred: alert.createdAt,
        };
      }
      grouped[key].count++;
      if (alert.createdAt > grouped[key].lastOccurred) {
        grouped[key].lastOccurred = alert.createdAt;
      }
    }

    return {
      total: alerts.length,
      critical,
      warning,
      info,
      items: Object.values(grouped),
    };
  }

  private async buildTrendCharts(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<SensorTrendChart[]> {
    const sensorIds = await this.getSensorIds(greenHouseId);
    const sensors = await this.sensorModel
      .find({ _id: { $in: sensorIds } })
      .exec();

    const charts: SensorTrendChart[] = [];

    for (const sensor of sensors) {
      const records = await this.sensorDataModel
        .find({
          sensorId: sensor._id,
          recordedAt: { $gte: from, $lte: to },
        })
        .sort({ recordedAt: 1 })
        .limit(200)
        .exec();

      if (!records.length) continue;

      const values = records.map((r) => r.sensorDataValue);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      charts.push({
        sensorType: sensor.sensorType,
        unit: sensor.sensorsUnit,
        current: values.at(-1) ?? 0,
        average: Math.round(avg * 10) / 10,
        min: Math.min(...values),
        max: Math.max(...values),
        dataPoints: records.map((r) => ({
          timestamp: r.recordedAt,
          value: r.sensorDataValue,
        })),
      });
    }

    return charts;
  }

  private async getSensorIds(greenHouseId: string): Promise<Types.ObjectId[]> {
    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .select('_id')
      .exec();
    const deviceIds = devices.map((d) => d._id);
    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds } })
      .select('_id')
      .exec();
    return sensors.map((s) => s._id);
  }

  private async getSensorIdsByType(
    greenHouseId: string,
    sensorType: string,
  ): Promise<Types.ObjectId[]> {
    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .select('_id')
      .exec();
    const deviceIds = devices.map((d) => d._id);
    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds }, sensorType })
      .select('_id')
      .exec();
    return sensors.map((s) => s._id);
  }

  private async countAlerts(
    sensorIds: Types.ObjectId[],
    from: Date,
    to: Date,
  ): Promise<number> {
    return this.alertModel.countDocuments({
      sensorsId: { $in: sensorIds },
      createdAt: { $gte: from, $lte: to },
    });
  }

  private resolvePeriod(input: GetReportInput): { from: Date; to: Date } {
    const to = new Date();
    const from = new Date();

    switch (input.period) {
      case ReportPeriod.LAST_7_DAYS:
        from.setDate(from.getDate() - 7);
        break;
      case ReportPeriod.LAST_30_DAYS:
        from.setDate(from.getDate() - 30);
        break;
      case ReportPeriod.LAST_90_DAYS:
        from.setDate(from.getDate() - 90);
        break;
      case ReportPeriod.CUSTOM:
        return {
          from: new Date(input.customFrom!),
          to: new Date(input.customTo!),
        };
    }
    return { from, to };
  }
}
