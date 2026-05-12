import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AnalysisService } from '../analysis/analysis.service';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly analysisService: AnalysisService,
  ) {}

  @Get()
  async findAll(@Query() query: ListJobsQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.jobsService.findOne(id);
    return { data };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateJobStatusDto) {
    const data = await this.jobsService.updateStatus(id, dto);
    return { data };
  }

  @Post(':id/analyze')
  async analyzeJob(@Param('id') id: string) {
    await this.jobsService.findOne(id);
    await this.analysisService.queueJob(id);
    return { data: { message: 'Analysis queued', jobId: id } };
  }
}
