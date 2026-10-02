import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { CalibrationService } from './calibration.service';
import {
  CalibrationResult,
  SensorCalibration,
  SetCalibrationInput,
} from '../../libs/dto/mid-iot/calibration';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { AuthMember } from '../../account-context-module/auth/decorators/authMember.decorator';

@Resolver()
@UseGuards(AuthGuard)
export class CalibrationResolver {
  constructor(private readonly calibService: CalibrationService) {}

  @Mutation(() => SensorCalibration)
  public async setSensorCalibration(
    @Args('input') input: SetCalibrationInput,
    @AuthMember('_id') memberId: string,
  ): Promise<SensorCalibration> {
    return this.calibService.setCalibration(input, memberId) as any;
  }

  @Query(() => CalibrationResult)
  public async calibrationPreview(
    @Args('sensorId', { type: () => ID }) sensorId: string,
    @Args('rawValue', { type: () => Float }) rawValue: number,
  ): Promise<CalibrationResult> {
    return this.calibService.preview(sensorId, rawValue);
  }

  @Query(() => SensorCalibration, {
    nullable: true,
  })
  public async sensorCalibration(
    @Args('sensorId', { type: () => ID }) sensorId: string,
  ): Promise<SensorCalibration | null> {
    return this.calibService.findBySensor(sensorId) as any;
  }

  @Mutation(() => Boolean)
  public async disableCalibration(
    @Args('sensorId', { type: () => ID }) sensorId: string,
  ): Promise<boolean> {
    await this.calibService.disable(sensorId);
    return true;
  }
}
