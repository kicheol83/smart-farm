import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { ReportsService } from './reports.service';
import {
  CreateReportEntryInput,
  FullGreenhouseReport,
  GetReportEntriesInput,
  GetReportInput,
  PaginatedReportEntries,
  Report,
  ReportEntry,
  SaveReportInput,
} from '../../libs/dto/ops-context-dto/reports/report';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

@Resolver()
export class ReportsResolver {
  constructor(private readonly reportService: ReportsService) {}

  @Query(() => FullGreenhouseReport, {})
  @UseGuards(AuthGuard)
  public async greenhouseFullReport(
    @Args('input') input: GetReportInput,
  ): Promise<FullGreenhouseReport> {
    const result = await this.reportService.getFullReport(input);
    return result;
  }

  @Mutation(() => Report)
  @UseGuards(AuthGuard)
  public async saveReport(
    @Args('input') input: SaveReportInput,
  ): Promise<Report> {
    const result = (await this.reportService.saveReport(input)) as any;
    return result;
  }

  @Query(() => [Report])
  @UseGuards(AuthGuard)
  public async savedReports(
    @Args('greenHouseId', { type: () => ID }) greenHouseId: string,
  ): Promise<Report[]> {
    const result = (await this.reportService.findReports(greenHouseId)) as any;
    return result;
  }

  @Query(() => PaginatedReportEntries)
  @UseGuards(AuthGuard)
  async reportEntries(
    @Args('input') input: GetReportEntriesInput,
  ): Promise<PaginatedReportEntries> {
    return this.reportService.findReportEntries(input);
  }

  @Mutation(() => ReportEntry, {})
  @UseGuards(AuthGuard)
  async generateReportEntry(
    @Args('input') input: CreateReportEntryInput,
  ): Promise<ReportEntry> {
    return this.reportService.generateReportEntry(input) as any;
  }
}
