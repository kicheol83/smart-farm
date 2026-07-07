import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Schema } from 'mongoose';
import {
  AiAnalysisResult,
  IrrigationDecision,
  SoilCondition,
  PlantStress,
  SensorSnapshot,
  SensorInsight,
} from '../../libs/dto/ai.analysis.dto';

export const IrrigationLogSchema = new Schema(
  {
    greenHouseId: {
      type: Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
    },
    decision: { type: String, required: true },
    durationSec: { type: Number, required: true },
    waterUsedLiters: { type: Number, default: null },
    isAutomatic: { type: Boolean, default: true },
    soilMoistureBefore: { type: Number, required: true },
    soilMoistureAfter: { type: Number, default: null },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'irrigationLogs' },
);

IrrigationLogSchema.index({ greenHouseId: 1, startedAt: -1 });

const THRESHOLDS = {
  soil: {
    dry: 30,
    optimal: 70,
    wet: 90,
  },
  temperature: {
    min: 10,
    max: 38,
    optimal_min: 18,
    optimal_max: 30,
  },
  humidity: {
    min: 40,
    max: 90,
  },
  light: {
    min: 200,
  },
  waterLevel: {
    low: 20,
    critical: 10,
  },
};

interface ISensorData extends Document {
  sensorDataValue: number;
  recordedAt: Date;
  sensorId: Types.ObjectId;
}

interface ISensor extends Document {
  _id: Types.ObjectId;
  sensorType: string;
  deviceId: Types.ObjectId;
}

interface IDevice extends Document {
  _id: Types.ObjectId;
  greenHouseId: Types.ObjectId;
}

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  constructor(
    @InjectModel('sensor_data')
    private readonly sensorDataModel: Model<ISensorData>,

    @InjectModel('sensors')
    private readonly sensorModel: Model<ISensor>,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('irrigationLogs')
    private readonly irrigationLogModel: Model<any>,
  ) {}

  async analyze(greenHouseId: string): Promise<AiAnalysisResult> {
    const snapshot = await this.getSnapshot(greenHouseId);

    const insights = this.buildInsights(snapshot);

    const decision = this.makeDecision(snapshot);

    const soilCondition = this.getSoilCondition(snapshot.soilMoisture);

    const plantStress = this.getPlantStress(snapshot);

    const urgency = this.calcUrgency(snapshot);

    const { durationSec, waterLiters } =
      this.calcRecommendedIrrigation(snapshot);

    const summary = this.buildSummary(
      decision,
      soilCondition,
      plantStress,
      snapshot,
    );

    this.logger.log(
      `AI Analysis | gh=${greenHouseId} | decision=${decision} | urgency=${urgency}%`,
    );

    return {
      greenHouseId,
      irrigationDecision: decision,
      soilCondition,
      plantStress,
      irrigationUrgency: urgency,
      recommendedDurationSec: durationSec,
      recommendedWaterLiters: waterLiters,
      insights,
      summary,
      analyzedAt: new Date(),
    };
  }

  async saveLog(data: {
    greenHouseId: string;
    decision: IrrigationDecision;
    durationSec: number;
    isAutomatic: boolean;
    soilMoistureBefore: number;
  }): Promise<any> {
    return this.irrigationLogModel.create({
      ...data,
      greenHouseId: new Types.ObjectId(data.greenHouseId),
      startedAt: new Date(),
    });
  }

  async completeLog(logId: string, soilMoistureAfter: number): Promise<void> {
    await this.irrigationLogModel.findByIdAndUpdate(logId, {
      soilMoistureAfter,
      completedAt: new Date(),
    });
  }

  async getLogs(greenHouseId: string, limit = 20): Promise<any[]> {
    return this.irrigationLogModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ startedAt: -1 })
      .limit(limit)
      .exec();
  }

  private async getSnapshot(greenHouseId: string): Promise<SensorSnapshot> {
    const devices = await this.deviceModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .select('_id')
      .exec();

    const deviceIds = devices.map((d) => d._id);
    const sensors = await this.sensorModel
      .find({ deviceId: { $in: deviceIds } })
      .exec();

    const snapshot: Partial<SensorSnapshot> = {
      measuredAt: new Date(),
    };

    for (const sensor of sensors) {
      const latest = await this.sensorDataModel
        .findOne({ sensorId: sensor._id })
        .sort({ recordedAt: -1 })
        .exec();

      if (!latest) continue;

      switch (sensor.sensorType) {
        case 'TEMPERATURE':
          snapshot.temperature = latest.sensorDataValue;
          break;
        case 'HUMIDITY':
          snapshot.humidity = latest.sensorDataValue;
          break;
        case 'SOIL_MOISTURE':
          snapshot.soilMoisture = latest.sensorDataValue;
          break;
        case 'LIGHT':
          snapshot.light = latest.sensorDataValue;
          break;
        case 'WATER_LEVEL':
          snapshot.waterLevel = latest.sensorDataValue;
          break;
      }

      if (latest.recordedAt > snapshot.measuredAt!) {
        snapshot.measuredAt = latest.recordedAt;
      }
    }

    return snapshot as SensorSnapshot;
  }

  private makeDecision(s: SensorSnapshot): IrrigationDecision {
    if (
      s.waterLevel !== undefined &&
      s.waterLevel < THRESHOLDS.waterLevel.critical
    ) {
      return IrrigationDecision.ERROR;
    }

    if (s.soilMoisture === undefined) {
      return IrrigationDecision.ERROR;
    }

    if (s.soilMoisture > THRESHOLDS.soil.wet) {
      return IrrigationDecision.NO_IRRIGATION;
    }

    if (
      s.temperature !== undefined &&
      s.temperature > THRESHOLDS.temperature.max
    ) {
      return IrrigationDecision.IRRIGATE_SOON;
    }

    if (s.soilMoisture < THRESHOLDS.soil.dry) {
      return IrrigationDecision.IRRIGATE_NOW;
    }

    if (s.soilMoisture < THRESHOLDS.soil.optimal) {
      return IrrigationDecision.IRRIGATE_SOON;
    }

    return IrrigationDecision.NO_IRRIGATION;
  }

  private getSoilCondition(soilMoisture?: number): SoilCondition {
    if (!soilMoisture) return SoilCondition.DRY;
    if (soilMoisture > 90) return SoilCondition.FLOODED;
    if (soilMoisture > THRESHOLDS.soil.optimal) return SoilCondition.WET;
    if (soilMoisture >= THRESHOLDS.soil.dry) return SoilCondition.OPTIMAL;
    return SoilCondition.DRY;
  }

  private getPlantStress(s: SensorSnapshot): PlantStress {
    let score = 0;

    if (s.soilMoisture !== undefined) {
      if (s.soilMoisture < 20) score += 3;
      else if (s.soilMoisture < 30) score += 2;
      else if (s.soilMoisture < 40) score += 1;
    }

    if (s.temperature !== undefined) {
      if (s.temperature > 40 || s.temperature < 5) score += 3;
      else if (s.temperature > 35 || s.temperature < 10) score += 2;
      else if (s.temperature > 30 || s.temperature < 15) score += 1;
    }

    if (s.humidity !== undefined) {
      if (s.humidity < 30 || s.humidity > 95) score += 2;
      else if (s.humidity < 40 || s.humidity > 90) score += 1;
    }

    if (score >= 6) return PlantStress.CRITICAL;
    if (score >= 4) return PlantStress.HIGH;
    if (score >= 2) return PlantStress.MEDIUM;
    if (score >= 1) return PlantStress.LOW;
    return PlantStress.NONE;
  }

  private calcUrgency(s: SensorSnapshot): number {
    if (!s.soilMoisture) return 0;

    const moistureUrgency = Math.max(
      0,
      Math.min(
        100,
        ((THRESHOLDS.soil.optimal - s.soilMoisture) / THRESHOLDS.soil.optimal) *
          100,
      ),
    );

    let tempFactor = 1;
    if (s.temperature !== undefined && s.temperature > 30) {
      tempFactor = 1 + (s.temperature - 30) * 0.05;
    }

    return Math.min(100, Math.round(moistureUrgency * tempFactor));
  }

  private calcRecommendedIrrigation(s: SensorSnapshot): {
    durationSec: number;
    waterLiters: number;
  } {
    const soilMoisture = s.soilMoisture ?? 50;
    const deficit = Math.max(0, THRESHOLDS.soil.optimal - soilMoisture);

    const durationSec = Math.round((deficit / 10) * 30);

    const waterLiters = Math.round(durationSec * (0.5 / 60) * 10) / 10;

    return { durationSec, waterLiters };
  }

  private buildInsights(s: SensorSnapshot): SensorInsight[] {
    const insights: SensorInsight[] = [];

    if (s.soilMoisture !== undefined) {
      insights.push({
        field: 'soilMoisture',
        value: s.soilMoisture,
        status: this.getSoilCondition(s.soilMoisture),
        message:
          `Tuproq namligi ${s.soilMoisture}% — ` +
          (s.soilMoisture < 30
            ? "juda quruq, sug'orish kerak"
            : s.soilMoisture < 70
              ? 'optimal holat'
              : 'juda nam'),
      });
    }

    if (s.temperature !== undefined) {
      const ok =
        s.temperature >= THRESHOLDS.temperature.optimal_min &&
        s.temperature <= THRESHOLDS.temperature.optimal_max;
      insights.push({
        field: 'temperature',
        value: s.temperature,
        status: ok
          ? 'OPTIMAL'
          : s.temperature > THRESHOLDS.temperature.max
            ? 'HIGH'
            : 'LOW',
        message: `Harorat ${s.temperature}°C — ${ok ? 'normal' : 'chegaradan tashqarida'}`,
      });
    }

    if (s.humidity !== undefined) {
      const ok =
        s.humidity >= THRESHOLDS.humidity.min &&
        s.humidity <= THRESHOLDS.humidity.max;
      insights.push({
        field: 'humidity',
        value: s.humidity,
        status: ok ? 'OPTIMAL' : 'WARNING',
        message: `Namlik ${s.humidity}% — ${ok ? 'normal' : "muvozanat yo'q"}`,
      });
    }

    if (s.waterLevel !== undefined) {
      const low = s.waterLevel < THRESHOLDS.waterLevel.low;
      insights.push({
        field: 'waterLevel',
        value: s.waterLevel,
        status: low ? 'LOW' : 'OK',
        message: `Suv tanki ${s.waterLevel}% — ${low ? "to'ldirish kerak!" : 'yetarli'}`,
      });
    }

    if (s.light !== undefined) {
      insights.push({
        field: 'light',
        value: s.light,
        status: s.light < THRESHOLDS.light.min ? 'LOW' : 'OK',
        message: `Yorug\'lik ${s.light} lux — ${s.light < THRESHOLDS.light.min ? "qo'shimcha yorug'lik kerak" : 'yetarli'}`,
      });
    }

    return insights;
  }

  private buildSummary(
    decision: IrrigationDecision,
    soilCondition: SoilCondition,
    plantStress: PlantStress,
    s: SensorSnapshot,
  ): string {
    const soilText =
      s.soilMoisture !== undefined ? `${s.soilMoisture}%` : "ma'lum emas";
    const tempText = s.temperature !== undefined ? `${s.temperature}°C` : '';

    switch (decision) {
      case IrrigationDecision.IRRIGATE_NOW:
        return (
          `Darhol sug\'orish tavsiya etiladi. Tuproq namligi ${soilText} — juda quruq. ` +
          `O\'simlik stressi: ${plantStress}. ${tempText ? `Harorat: ${tempText}.` : ''}`
        );

      case IrrigationDecision.IRRIGATE_SOON:
        return (
          `30 daqiqa ichida sug\'orish kerak bo\'ladi. Tuproq ${soilText}. ` +
          `O\'simlik holati: ${plantStress === 'NONE' ? 'yaxshi' : plantStress}.`
        );

      case IrrigationDecision.NO_IRRIGATION:
        return (
          `Sug\'orish shart emas. Tuproq namligi ${soilText} — ` +
          (soilCondition === SoilCondition.WET
            ? 'juda nam.'
            : 'optimal darajada.')
        );

      case IrrigationDecision.ERROR:
        return s.waterLevel !== undefined && s.waterLevel < 10
          ? `Suv tanki ${s.waterLevel}% — kritik darajada past! Darhol to\'ldiring.`
          : "Sensor ma'lumotlari yetarli emas. Qurilma ulanishini tekshiring.";

      default:
        return 'Tahlil davom etmoqda...';
    }
  }
}
