import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { AiAnalysisService } from '../ai-analysis/ai-analysis.service';
import { MqttService } from '../../iot/mqtt/mqtt.service';
import { IrrigationDecision } from '../../libs/dto/ai.analysis.dto';

const IRRIGATION_LOCK_PREFIX = 'irrigation:lock:';
const IRRIGATION_LOCK_TTL = 10 * 60;
const CHECK_INTERVAL_MINUTES = 5;
interface IDevice extends Document {
  _id: Types.ObjectId;
  deviceName: string;
  deviceType: string;
  greenHouseId: Types.ObjectId;
}

interface IGreenhouse extends Document {
  _id: Types.ObjectId;
  greenHouseName: string;
}

@Injectable()
export class AutoIrrigationService implements OnModuleInit {
  private readonly logger = new Logger(AutoIrrigationService.name);

  private autoModeEnabled = true;

  constructor(
    private readonly aiAnalysisService: AiAnalysisService,
    private readonly mqttService: MqttService,

    @InjectRedis()
    private readonly redis: Redis,

    @InjectModel('devices')
    private readonly deviceModel: Model<IDevice>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,
  ) {}

  onModuleInit(): void {
    this.logger.log(
      `AutoIrrigationService initialized | autoMode=${this.autoModeEnabled}`,
    );
  }

  @Cron(`0 */${CHECK_INTERVAL_MINUTES} * * * *`)
  async checkAndIrrigate(): Promise<void> {
    if (!this.autoModeEnabled) return;

    const greenhouses = await this.greenhouseModel.find().exec();

    for (const gh of greenhouses) {
      await this.processGreenhouse(String(gh._id), gh.greenHouseName);
    }
  }

  private async processGreenhouse(
    greenHouseId: string,
    greenHouseName: string,
  ): Promise<void> {
    const lockKey = `${IRRIGATION_LOCK_PREFIX}${greenHouseId}`;
    const locked = await this.redis.get(lockKey);
    if (locked) {
      this.logger.debug(`Irrigation already running | gh=${greenHouseName}`);
      return;
    }

    const analysis = await this.aiAnalysisService.analyze(greenHouseId);

    this.logger.log(
      `AI check | gh=${greenHouseName} | decision=${analysis.irrigationDecision} | ` +
        `urgency=${analysis.irrigationUrgency}%`,
    );

    if (
      analysis.irrigationDecision === IrrigationDecision.NO_IRRIGATION ||
      analysis.irrigationDecision === IrrigationDecision.SKIP_RAIN
    ) {
      return;
    }

    if (analysis.irrigationDecision === IrrigationDecision.ERROR) {
      this.logger.warn(
        `Cannot irrigate | gh=${greenHouseName} | ${analysis.summary}`,
      );
      return;
    }

    if (
      analysis.irrigationDecision === IrrigationDecision.IRRIGATE_SOON &&
      analysis.irrigationUrgency < 50
    ) {
      this.logger.debug(
        `Irrigation soon but not urgent yet | gh=${greenHouseName} | urgency=${analysis.irrigationUrgency}%`,
      );
      return;
    }

    const durationSec = analysis.recommendedDurationSec ?? 60;

    const soilMoisture =
      analysis.insights.find((i) => i.field === 'soilMoisture')?.value ?? 0;

    await this.startIrrigation(
      greenHouseId,
      greenHouseName,
      durationSec,
      soilMoisture,
      true,
    );
  }

  async startIrrigation(
    greenHouseId: string,
    greenHouseName: string,
    durationSec: number,
    soilMoistureBefore: number,
    isAutomatic: boolean,
  ): Promise<{ logId: string; durationSec: number }> {
    const lockKey = `${IRRIGATION_LOCK_PREFIX}${greenHouseId}`;
    await this.redis.setex(lockKey, IRRIGATION_LOCK_TTL, 'running');

    const log = await this.aiAnalysisService.saveLog({
      greenHouseId,
      decision: isAutomatic
        ? IrrigationDecision.IRRIGATE_NOW
        : IrrigationDecision.IRRIGATE_NOW,
      durationSec,
      isAutomatic,
      soilMoistureBefore,
    });

    const relayDevice = await this.findRelayDevice(greenHouseId);

    if (!relayDevice) {
      this.logger.warn(`No relay device found | gh=${greenHouseName}`);
      await this.redis.del(lockKey);
      return { logId: String(log._id), durationSec: 0 };
    }

    this.mqttService.publish(
      MqttService.TOPICS.COMMAND(String(relayDevice._id)),
      {
        commandId: String(log._id),
        commandType: 'RELAY_ON',
        payload: { pin: 'PUMP', state: 1 },
        timestamp: new Date().toISOString(),
      },
    );

    this.logger.log(
      `Irrigation STARTED | gh=${greenHouseName} | duration=${durationSec}s | auto=${isAutomatic}`,
    );

    setTimeout(async () => {
      await this.stopIrrigation(
        greenHouseId,
        greenHouseName,
        String(log._id),
        String(relayDevice._id),
      );
    }, durationSec * 1000);

    return { logId: String(log._id), durationSec };
  }

  async stopIrrigation(
    greenHouseId: string,
    greenHouseName: string,
    logId: string,
    relayDeviceId: string,
  ): Promise<void> {
    this.mqttService.publish(MqttService.TOPICS.COMMAND(relayDeviceId), {
      commandId: logId,
      commandType: 'RELAY_OFF',
      payload: { pin: 'PUMP', state: 0 },
      timestamp: new Date().toISOString(),
    });

    await this.redis.del(`${IRRIGATION_LOCK_PREFIX}${greenHouseId}`);
    await this.aiAnalysisService.completeLog(logId, 0);

    this.logger.log(`Irrigation STOPPED | gh=${greenHouseName}`);
  }

  async manualIrrigate(
    greenHouseId: string,
    durationSec: number,
  ): Promise<{ logId: string; durationSec: number }> {
    const gh = await this.greenhouseModel.findById(greenHouseId).exec();
    const analysis = await this.aiAnalysisService.analyze(greenHouseId);
    const soilMoisture =
      analysis.insights.find((i) => i.field === 'soilMoisture')?.value ?? 0;

    return this.startIrrigation(
      greenHouseId,
      gh?.greenHouseName ?? greenHouseId,
      durationSec,
      soilMoisture,
      false,
    );
  }

  setAutoMode(enabled: boolean): void {
    this.autoModeEnabled = enabled;
    this.logger.log(`Auto irrigation mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  isAutoModeEnabled(): boolean {
    return this.autoModeEnabled;
  }

  private async findRelayDevice(greenHouseId: string) {
    return this.deviceModel
      .findOne({
        greenHouseId: new Types.ObjectId(greenHouseId),
        deviceType: 'CONTROLLER',
      })
      .exec();
  }
}
