import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobAnalysis } from './entities/job-analysis.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobAnalysis]),
    forwardRef(() => AnalysisModule),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService, TypeOrmModule],
})
export class JobsModule {}
