import { Module } from '@nestjs/common';
import { CameraResolver } from './camera.resolver';
import { CameraService } from './camera.service';
import { CameraSnapshootsSchema } from '../../schemas/iot/CameraSnapshots';
import { MongooseModule } from '@nestjs/mongoose';
import { GreenHouseSchema } from '../../schemas/farm/GreenHouse.model';
import { AuthModule } from '../../account-context-module/auth/auth.module';
import CameraSchema from '../../schemas/iot/Camera.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'cameras', schema: CameraSchema },
      { name: 'camera_snapshots', schema: CameraSnapshootsSchema },
      { name: 'greenHouses', schema: GreenHouseSchema },
    ]),
    AuthModule,
  ],
  providers: [CameraResolver, CameraService],
  exports: [CameraService],
})
export class CameraModule {}
