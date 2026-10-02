import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CameraService } from './camera.service';
import {
  Camera,
  CameraSnapshot,
  CameraStatus,
  CreateCameraInput,
  CreateSnapshotInput,
  UpdateCameraInput,
} from '../../libs/dto/iot-context-dto/camera/camera';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { OwnedBy } from '../../ownership/owned-by.decorator';

@Resolver(() => Camera)
export class CameraResolver {
  constructor(private readonly cameraService: CameraService) {}

  @Mutation(() => Camera)
  @UseGuards(AuthGuard)
  public async createCamera(
    @Args('input') input: CreateCameraInput,
  ): Promise<Camera> {
    const result = this.cameraService.create(input) as any;
    return result;
  }

  @Query(() => [Camera])
  @UseGuards(AuthGuard)
  public async camerasByGreenhouse(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<Camera[]> {
    const result = this.cameraService.findByGreenhouse(greenHouseId) as any;
    return result;
  }

  @Query(() => Camera)
  @UseGuards(AuthGuard)
  @OwnedBy('camera')
  public async camera(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Camera> {
    const result = this.cameraService.findOne(id) as any;
    return result;
  }

  @Mutation(() => Camera)
  @UseGuards(AuthGuard)
  @OwnedBy('camera')
  public async updateCamera(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCameraInput,
  ): Promise<Camera> {
    const result = this.cameraService.update(id, input) as any;
    return result;
  }

  @Mutation(() => Camera)
  @UseGuards(AuthGuard)
  @OwnedBy('camera')
  public async updateCameraStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => CameraStatus }) status: CameraStatus,
  ): Promise<Camera> {
    const result = this.cameraService.updateStatus(id, status) as any;
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @OwnedBy('camera')
  public async deleteCamera(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = this.cameraService.remove(id);
    return result;
  }

  @Mutation(() => CameraSnapshot)
  @UseGuards(AuthGuard)
  public async saveSnapshot(
    @Args('input') input: CreateSnapshotInput,
  ): Promise<CameraSnapshot> {
    const result = this.cameraService.saveSnapshot(input) as any;
    return result;
  }

  @Query(() => [CameraSnapshot])
  @UseGuards(AuthGuard)
  public async cameraSnapshots(
    @Args('cameraId', { type: () => ID }) cameraId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<CameraSnapshot[]> {
    const result = this.cameraService.findSnapshots(cameraId, limit) as any;
    return result;
  }
}
