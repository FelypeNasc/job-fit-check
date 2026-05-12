import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../jobs/entities/job.entity';
import { JobAnalysis } from '../jobs/entities/job-analysis.entity';
import { OllamaModule } from '../ollama/ollama.module';
import { ProfileModule } from '../profile/profile.module';
import { JobsModule } from '../jobs/jobs.module';
import { AnalysisService } from './analysis.service';
import { AnalysisProcessor } from './analysis.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'job-analysis' }),
    TypeOrmModule.forFeature([Job, JobAnalysis]),
    OllamaModule,
    ProfileModule,
    forwardRef(() => JobsModule),
  ],
  providers: [AnalysisService, AnalysisProcessor],
  exports: [AnalysisService],
})
export class AnalysisModule {}
