import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OwnedResource } from './owned-by.decorator';

type ParentLink = { parent: OwnedResource; field: string };

const PARENT: Partial<Record<OwnedResource, ParentLink>> = {
  greenhouse: { parent: 'farm', field: 'farmsId' },
  section: { parent: 'greenhouse', field: 'greenHouseId' },
  device: { parent: 'greenhouse', field: 'greenHouseId' },
  sensor: { parent: 'device', field: 'deviceId' },
  camera: { parent: 'greenhouse', field: 'greenHouseId' },
  actuator: { parent: 'greenhouse', field: 'greenHouseId' },
  automationRule: { parent: 'greenhouse', field: 'greenHouseId' },
  task: { parent: 'greenhouse', field: 'greenHousesId' },
  anomaly: { parent: 'greenhouse', field: 'greenHouseId' },
};

@Injectable()
export class OwnershipService {
  private readonly models: Record<OwnedResource, Model<any>>;

  constructor(
    @InjectModel('farms') farms: Model<any>,
    @InjectModel('greenHouses') greenhouses: Model<any>,
    @InjectModel('sections') sections: Model<any>,
    @InjectModel('devices') devices: Model<any>,
    @InjectModel('sensors') sensors: Model<any>,
    @InjectModel('cameras') cameras: Model<any>,
    @InjectModel('actuators') actuators: Model<any>,
    @InjectModel('automationRules') automationRules: Model<any>,
    @InjectModel('tasks') tasks: Model<any>,
    @InjectModel('anomalyLogs') anomalies: Model<any>,
  ) {
    this.models = {
      farm: farms,
      greenhouse: greenhouses,
      section: sections,
      device: devices,
      sensor: sensors,
      camera: cameras,
      actuator: actuators,
      automationRule: automationRules,
      task: tasks,
      anomaly: anomalies,
    };
  }

  async assertOwner(
    memberId: string,
    resource: OwnedResource,
    id: unknown,
    cache: Map<string, string | null> = new Map(),
  ): Promise<void> {
    const owner = await this.resolveOwner(resource, id, cache);
    if (owner !== null && owner !== String(memberId)) {
      throw new ForbiddenException('You do not have access to this resource.');
    }
  }

  private async resolveOwner(
    resource: OwnedResource,
    id: unknown,
    cache: Map<string, string | null>,
  ): Promise<string | null> {
    if (id === null || id === undefined || !Types.ObjectId.isValid(String(id))) {
      return null;
    }

    const cacheKey = `${resource}:${String(id)}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) ?? null;
    }

    let owner: string | null = null;
    if (resource === 'farm') {
      const farm = (await this.models.farm
        .findById(id)
        .select('memberId')
        .lean()
        .exec()) as { memberId?: unknown } | null;
      owner = farm ? (farm.memberId ? String(farm.memberId) : '') : null;
    } else {
      const link = PARENT[resource];
      if (link) {
        const doc = (await this.models[resource]
          .findById(id)
          .select(link.field)
          .lean()
          .exec()) as Record<string, unknown> | null;
        owner = doc ? await this.resolveOwner(link.parent, doc[link.field], cache) : null;
        if (doc && owner === null) {
          owner = '';
        }
      }
    }

    cache.set(cacheKey, owner);
    return owner;
  }
}
