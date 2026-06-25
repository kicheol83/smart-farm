import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  CreateCameraInput,
  UpdateCameraInput,
  CreateSnapshotInput,
  CameraStatus,
} from '../../libs/dto/iot-context-dto/camera/camera';
import { IGreenhouse } from '../../farm-context-module/greenhouse/greenhouse.service';

export interface ICamera extends Document {
  _id: Types.ObjectId;
  cameraStreamUrl: string;
  cameraStatus: string;
  greenHouseId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICameraSnapshot extends Document {
  _id: Types.ObjectId;
  snapshotUrl: string;
  captureAt: Date;
  cameraId: Types.ObjectId;
}

@Injectable()
export class CameraService {
  private readonly logger = new Logger(CameraService.name);

  constructor(
    @InjectModel('cameras')
    private readonly cameraModel: Model<ICamera>,

    @InjectModel('camera_snapshots')
    private readonly snapshotModel: Model<ICameraSnapshot>,

    @InjectModel('greenHouses')
    private readonly greenhouseModel: Model<IGreenhouse>,
  ) {}

  public async create(input: CreateCameraInput): Promise<ICamera> {
    if (!Types.ObjectId.isValid(input.greenHouseId)) {
      throw new BadRequestException('Invalid greenHouseId');
    }

    const greenhouse = await this.greenhouseModel.findById(input.greenHouseId);
    if (!greenhouse) {
      throw new NotFoundException('Greenhouse not found');
    }
    const result = await this.cameraModel.create({
      ...input,
      cameraStatus: CameraStatus.OFFLINE,
      greenHouseId: new Types.ObjectId(input.greenHouseId),
    });
    this.logger.log(`Camera created | gh=${input.greenHouseId}`);
    return result;
  }

  public async findByGreenhouse(greenHouseId: string): Promise<ICamera[]> {
    const result = await this.cameraModel
      .find({ greenHouseId: new Types.ObjectId(greenHouseId) })
      .sort({ createdAt: -1 })
      .exec();
    return result;
  }

  public async findOne(id: string): Promise<ICamera> {
    const result = await this.cameraModel.findById(id).exec();
    if (!result) throw new NotFoundException('Camera not found.');
    return result;
  }

  public async update(id: string, input: UpdateCameraInput): Promise<ICamera> {
    const result = await this.cameraModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!result) throw new NotFoundException('Camera not found.');
    return result;
  }

  public async remove(id: string): Promise<boolean> {
    const result = await this.cameraModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Camera not found.');
    return true;
  }

  public async updateStatus(
    id: string,
    status: CameraStatus,
  ): Promise<ICamera> {
    const result = await this.cameraModel
      .findByIdAndUpdate(id, { cameraStatus: status }, { new: true })
      .exec();
    if (!result) throw new NotFoundException('Camera not found.');
    this.logger.log(`Camera status | id=${id} → ${status}`);
    return result;
  }

  public async saveSnapshot(
    input: CreateSnapshotInput,
  ): Promise<ICameraSnapshot> {
    if (!Types.ObjectId.isValid(input.cameraId)) {
      throw new BadRequestException('Invalid cameraId');
    }

    const camera = await this.cameraModel.findById(input.cameraId);
    if (!camera) {
      throw new NotFoundException('Camera not found');
    }

    const snapshot = await this.snapshotModel.create({
      snapshotUrl: input.snapshotUrl,
      captureAt: new Date(input.captureAt),
      cameraId: new Types.ObjectId(input.cameraId),
    });
    this.logger.log(`Snapshot saved | camera=${input.cameraId}`);
    return snapshot;
  }

  public async findSnapshots(
    cameraId: string,
    limit = 20,
  ): Promise<ICameraSnapshot[]> {
    const result = await this.snapshotModel
      .find({ cameraId: new Types.ObjectId(cameraId) })
      .sort({ captureAt: -1 })
      .limit(limit)
      .exec();
    return result;
  }
}
