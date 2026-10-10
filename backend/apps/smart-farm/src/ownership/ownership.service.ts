import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OwnedResource } from './owned-by.decorator';

type ParentLink = { parent: OwnedResource; field: string };

const PARENT: Partial<Record<OwnedResource, ParentLink[]>> = {
  greenhouse: [{ parent: 'farm', field: 'farmsId' }],
  section: [{ parent: 'greenhouse', field: 'greenHouseId' }],
  device: [{ parent: 'greenhouse', field: 'greenHouseId' }],
  sensor: [{ parent: 'device', field: 'deviceId' }],
  camera: [{ parent: 'greenhouse', field: 'greenHouseId' }],
  actuator: [{ parent: 'greenhouse', field: 'greenHouseId' }],
  automationRule: [{ parent: 'greenhouse', field: 'greenHouseId' }],
  task: [{ parent: 'greenhouse', field: 'greenHousesId' }],
  anomaly: [{ parent: 'greenhouse', field: 'greenHouseId' }],
  field: [{ parent: 'section', field: 'sectionId' }],
  fieldMap: [{ parent: 'farm', field: 'farmId' }],
  sector: [{ parent: 'fieldMap', field: 'fieldId' }],
  alert: [
    { parent: 'sensor', field: 'sensorsId' },
    { parent: 'device', field: 'deviceId' },
    { parent: 'section', field: 'sectionId' },
  ],
  command: [{ parent: 'device', field: 'deviceId' }],
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
    @InjectModel('fields') fields: Model<any>,
    @InjectModel('fieldMaps') fieldMaps: Model<any>,
    @InjectModel('mapSectors') sectors: Model<any>,
    @InjectModel('alerts') alerts: Model<any>,
    @InjectModel('deviceCommands') commands: Model<any>,
  ) {
    this.models = {
      field: fields,
      fieldMap: fieldMaps,
      sector: sectors,
      alert: alerts,
      command: commands,
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
      const links = PARENT[resource];
      if (links) {
        const doc = (await this.models[resource]
          .findById(id)
          .select(links.map((l) => l.field).join(' '))
          .lean()
          .exec()) as Record<string, unknown> | null;
        if (doc) {
          const link = links.find((l) => doc[l.field] !== undefined && doc[l.field] !== null);
          owner = link ? await this.resolveOwner(link.parent, doc[link.field], cache) : null;
          if (owner === null) {
            owner = '';
          }
        }
      }
    }

    cache.set(cacheKey, owner);
    return owner;
  }

  async ownedSectionIds(memberId: string): Promise<Types.ObjectId[]> {
    const farmIds = await this.models.farm
      .find({ memberId: new Types.ObjectId(String(memberId)) })
      .distinct('_id')
      .exec();
    const greenhouseIds = await this.models.greenhouse
      .find({ farmsId: { $in: farmIds } })
      .distinct('_id')
      .exec();
    return this.models.section
      .find({ greenHouseId: { $in: greenhouseIds } })
      .distinct('_id')
      .exec();
  }
}
