import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateWaterUsageInput,
  WaterAnomalyReport,
  WaterCostEstimation,
  WaterEfficiencyReport,
  ZoneUsageReport,
} from '../../libs/dto/farm-context-dto/water-usage/water-usage';

export interface IWaterUsage extends Document {
  _id: Types.ObjectId;
  waterAmount: number;
  recordedAt: Date;
  greenHouseId: Types.ObjectId;
  sectionId?: Types.ObjectId;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ISection extends Document {
  _id: Types.ObjectId;
  sectionName: string;
  plantCount: number;
  greenHouseId: Types.ObjectId;
}

const COST_PER_LITER = 0.003;

const ANOMALY_THRESHOLD_PERCENT = 20;

@Injectable()
export class WaterUsageService {
  private readonly logger = new Logger(WaterUsageService.name);

  constructor(
    @InjectModel('waterUsages')
    private readonly waterUsageModel: Model<IWaterUsage>,

    @InjectModel('sections')
    private readonly sectionModel: Model<ISection>,
  ) {}

  async create(input: CreateWaterUsageInput): Promise<IWaterUsage> {
    const record = await this.waterUsageModel.create({
      ...input,
      recordedAt: new Date(input.recordedAt),
      greenHouseId: new Types.ObjectId(input.greenHouseId),
      sectionId: input.sectionId
        ? new Types.ObjectId(input.sectionId)
        : undefined,
    });
    this.logger.log(
      `WaterUsage recorded | ${record.waterAmount}L | gh=${input.greenHouseId}`,
    );
    return record;
  }

  async findByGreenhouse(
    greenHouseId: string,
    limit = 50,
  ): Promise<IWaterUsage[]> {
    return this.waterUsageModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByDateRange(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<IWaterUsage[]> {
    return this.waterUsageModel
      .find({
        greenHouseId: new Types.ObjectId(greenHouseId),
        recordedAt: { $gte: from, $lte: to },
      })
      .sort({ recordedAt: 1 })
      .exec();
  }

  async getWaterEfficiencyReport(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<WaterEfficiencyReport> {
    const records = await this.findByDateRange(greenHouseId, from, to);
    const totalUsage = records.reduce((s, r) => s + r.waterAmount, 0);

    const totalDuration = records.reduce(
      (s, r) => s + (r.durationMinutes ?? 0),
      0,
    );
    const daysCount = Math.max(1, this.countUniqueDays(records));
    const irrigationDurationMinutes =
      Math.round((totalDuration / daysCount) * 10) / 10;

    const sections = await this.sectionModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .exec();
    const totalPlants = sections.reduce(
      (s, sec) => s + (sec.plantCount ?? 0),
      0,
    );
    const averageWaterPerPlant =
      totalPlants > 0
        ? Math.round((totalUsage / daysCount / totalPlants) * 100) / 100
        : 0;

    const litersPerMinute = totalDuration > 0 ? totalUsage / totalDuration : 0;
    const efficiencyScore = Math.min(100, Math.round(litersPerMinute * 20));

    return {
      efficiencyScore,
      averageWaterPerPlant,
      irrigationDurationMinutes,
      totalUsage: Math.round(totalUsage * 10) / 10,
    };
  }

  async getAnomalyDetection(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<WaterAnomalyReport> {
    const records = await this.findByDateRange(greenHouseId, from, to);

    const dailyTotals = this.groupByDay(records);
    const values = Object.values(dailyTotals);
    const avg = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;

    const anomalies = Object.entries(dailyTotals)
      .map(([date, amount]) => {
        const deviationPercent =
          avg > 0 ? Math.round(((amount - avg) / avg) * 100 * 10) / 10 : 0;
        return {
          date: new Date(date),
          amount: Math.round(amount * 10) / 10,
          deviationPercent,
        };
      })
      .filter((a) => Math.abs(a.deviationPercent) >= ANOMALY_THRESHOLD_PERCENT);

    return {
      anomalyCount: anomalies.length,
      alertThresholdPercent: ANOMALY_THRESHOLD_PERCENT,
      lastScan: new Date(),
      anomalies,
    };
  }

  async getCostEstimation(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<WaterCostEstimation> {
    const records = await this.findByDateRange(greenHouseId, from, to);
    const totalUsage = records.reduce((s, r) => s + r.waterAmount, 0);
    const days = Math.max(1, this.countUniqueDays(records));
    const costPerDay =
      Math.round((totalUsage / days) * COST_PER_LITER * 100) / 100;

    const periodLen = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodLen);
    const prevRecords = await this.findByDateRange(
      greenHouseId,
      prevFrom,
      from,
    );
    const prevTotal = prevRecords.reduce((s, r) => s + r.waterAmount, 0);
    const prevDays = Math.max(1, this.countUniqueDays(prevRecords));
    const prevCostPerDay = (prevTotal / prevDays) * COST_PER_LITER;

    const trendPercent =
      prevCostPerDay > 0
        ? Math.round(
            ((costPerDay - prevCostPerDay) / prevCostPerDay) * 100 * 10,
          ) / 10
        : 0;

    return {
      costPerDay,
      trendPercent,
      status:
        Math.abs(trendPercent) <= 15 ? 'Expected range' : 'Above expected',
      costPerLiter: COST_PER_LITER,
    };
  }

  async getZoneUsageReport(
    greenHouseId: string,
    from: Date,
    to: Date,
  ): Promise<ZoneUsageReport> {
    const records = await this.waterUsageModel
      .find({
        greenHouseId: new Types.ObjectId(greenHouseId),
        recordedAt: { $gte: from, $lte: to },
        sectionId: { $exists: true, $ne: null },
      })
      .exec();

    const sections = await this.sectionModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .exec();
    const sectionMap = new Map(
      sections.map((s) => [String(s._id), s.sectionName]),
    );

    const totals: Record<string, number> = {};
    for (const r of records) {
      if (!r.sectionId) continue;
      const key = String(r.sectionId);
      totals[key] = (totals[key] ?? 0) + r.waterAmount;
    }

    const values = Object.values(totals);
    const avg = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;

    const zones = Object.entries(totals).map(([sectionId, totalUsage]) => {
      let note = 'Status Normal';
      if (totalUsage > avg * 1.3)
        note = 'Highest consumption, irrigation system running optimally';
      else if (totalUsage < avg * 0.7)
        note = 'Below expected usage — check the valve or soil moisture level';

      return {
        sectionId,
        sectionName: sectionMap.get(sectionId) ?? 'Unknown Section',
        totalUsage: Math.round(totalUsage * 10) / 10,
        note,
      };
    });

    return { zones: zones.sort((a, b) => b.totalUsage - a.totalUsage) };
  }

  private countUniqueDays(records: IWaterUsage[]): number {
    const days = new Set(
      records.map((r) => r.recordedAt.toISOString().slice(0, 10)),
    );
    return days.size;
  }

  private groupByDay(records: IWaterUsage[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (const r of records) {
      const key = r.recordedAt.toISOString().slice(0, 10);
      result[key] = (result[key] ?? 0) + r.waterAmount;
    }
    return result;
  }
}
