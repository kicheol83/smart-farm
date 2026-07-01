import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DeviceAuthService } from './device-auth.service';

import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import {
  DeviceApiKey,
  GenerateDeviceApiKeyInput,
  RevokeDeviceApiKeyInput,
} from '../../libs/dto/device.auth.dto';

@Resolver(() => DeviceApiKey)
export class DeviceAuthResolver {
  constructor(private readonly deviceAuthService: DeviceAuthService) {}

  @Mutation(() => DeviceApiKey, {
    description: 'Qurilma uchun API key yaratish',
  })
  @UseGuards(AuthGuard)
  public async generateDeviceApiKey(
    @Args('input') input: GenerateDeviceApiKeyInput,
  ): Promise<DeviceApiKey> {
    const result = (await this.deviceAuthService.generateApiKey(input)) as any;
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  public async revokeDeviceApiKey(
    @Args('input') input: RevokeDeviceApiKeyInput,
  ): Promise<boolean> {
    const result = (await this.deviceAuthService.revokeApiKey(input)) as any;
    return result;
  }

  @Query(() => DeviceApiKey, {
    description: "Qurilma API key ma'lumoti",
    nullable: true,
  })
  @UseGuards(AuthGuard)
  public async deviceApiKey(
    @Args('deviceId', { type: () => ID }) deviceId: string,
  ): Promise<DeviceApiKey | null> {
    const result = (await this.deviceAuthService.findByDevice(deviceId)) as any;
    return result   ;
  }
}
