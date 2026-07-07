import {
  Resolver,
  Mutation,
  Query,
  Args,
  ID,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AutoIrrigationService } from './auto-irrigation.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';
import { ManualIrrigationInput } from '../../libs/dto/ai.analysis.dto';

@ObjectType()
export class IrrigationStartResult {
  @Field(() => ID)
  logId: string;

  @Field(() => Int)
  durationSec: number;

  @Field()
  message: string;
}

@ObjectType()
export class AutoModeStatus {
  @Field()
  enabled: boolean;

  @Field()
  message: string;
}

@Resolver()
export class AutoIrrigationResolver {
  constructor(private readonly autoIrrigationService: AutoIrrigationService) {}

  @Mutation(() => IrrigationStartResult)
  @UseGuards(AuthGuard)
  public async startManualIrrigation(
    @Args('input') input: ManualIrrigationInput,
  ): Promise<IrrigationStartResult> {
    const result = await this.autoIrrigationService.manualIrrigate(
      input.greenHouseId,
      input.durationSec,
    );

    const res = {
      logId: result.logId,
      durationSec: result.durationSec,
      message: `Sug'orish boshlandi — ${result.durationSec} soniya davom etadi`,
    };
    return res;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  public async stopIrrigation(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<boolean> {
    await this.autoIrrigationService.stopIrrigation(
      greenHouseId,
      greenHouseId,
      '',
      '',
    );
    return true;
  }

  @Mutation(() => AutoModeStatus)
  @UseGuards(AuthGuard)
  public async setAutoIrrigationMode(
    @Args('enabled') enabled: boolean,
  ): Promise<AutoModeStatus> {
    this.autoIrrigationService.setAutoMode(enabled);
    const result = {
      enabled,
      message: enabled
        ? 'Avtomatik rejim yoqildi — har 5 daqiqada tekshiriladi'
        : "Avtomatik rejim o'chirildi — faqat qo'lda boshqarish",
    };
    return result;
  }

  @Query(() => AutoModeStatus)
  @UseGuards(AuthGuard)
 public async autoIrrigationStatus(): Promise<AutoModeStatus> {
    const enabled = this.autoIrrigationService.isAutoModeEnabled();
    const result = {
      enabled,
      message: enabled ? 'Avtomatik rejim faol' : "Avtomatik rejim o'chirilgan",
    };
    return result;
  }
}
