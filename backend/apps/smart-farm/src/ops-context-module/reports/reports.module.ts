import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SensorDataSchema from '../../schemas/iot/SensorData.model';
import SensorsSchema from '../../schemas/iot/Sensors.model';
import DevicesSchema from '../../schemas/iot/Devices.model';
import AlertsSchema from '../../schemas/ops/Alerts.model';
import ReportsSchema from '../../schemas/ops/Reports.model';

import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';
import PlantHealthSchema from '../../schemas/farm/PlantHealth';
import WaterUsageSchema from '../../schemas/farm/WaterUsage';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'greenHouses',  schema: GreenHouseSchema  },
      { name: 'sensor_data',  schema: SensorDataSchema  },
      { name: 'sensors',      schema: SensorsSchema     },
      { name: 'devices',      schema: DevicesSchema     },
      { name: 'plantHealth',  schema: PlantHealthSchema },
      { name: 'waterUsages',  schema: WaterUsageSchema  },
      { name: 'alerts',       schema: AlertsSchema      },
      { name: 'reports',      schema: ReportsSchema     },
    ]),
  ],
  providers: [ReportsService, ReportsResolver],
  exports: [ReportsService],
})
export class ReportModule {}