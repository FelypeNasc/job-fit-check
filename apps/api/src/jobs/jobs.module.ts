import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobAnalysis } from './entities/job-analysis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, JobAnalysis])],
  exports: [TypeOrmModule],
})
export class JobsModule {}
