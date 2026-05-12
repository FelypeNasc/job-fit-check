import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job as BullJob } from 'bullmq';
import { JobStatus, LevelMatch, Recommendation } from '@job-analyzer/shared';
import { Job } from '../jobs/entities/job.entity';
import { JobAnalysis } from '../jobs/entities/job-analysis.entity';
import { OllamaService } from '../ollama/ollama.service';
import { ProfileService } from '../profile/profile.service';

@Processor('job-analysis', { concurrency: 1 })
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobAnalysis) private readonly analysisRepository: Repository<JobAnalysis>,
    private readonly ollamaService: OllamaService,
    private readonly profileService: ProfileService,
  ) {
    super();
  }

  async process(bullJob: BullJob<{ jobId: string }>): Promise<void> {
    const { jobId } = bullJob.data;

    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      this.logger.warn(`Job ${jobId} not found, skipping`);
      return;
    }

    this.logger.log(`Processing analysis for "${job.title}" at ${job.company}`);

    const profile = await this.profileService.getProfile();
    const ollamaResult = await this.ollamaService.analyzeJob(profile, {
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
    });

    this.logger.log(`Ollama analysis completed for "${job.title}": fit_score=${ollamaResult.fit_score}, recommendation=${ollamaResult.recommendation}`);

    const existingAnalysis = await this.analysisRepository.findOne({ where: { job: { id: jobId } } });
    if (existingAnalysis) {
      await this.analysisRepository.remove(existingAnalysis);
    }

    const analysis = this.analysisRepository.create({
      job,
      fitScore: ollamaResult.fit_score,
      matchingSkills: ollamaResult.matching_skills,
      missingSkills: ollamaResult.missing_skills,
      locationOk: ollamaResult.location_compatible,
      levelMatch: ollamaResult.level_match as LevelMatch,
      summary: ollamaResult.summary,
      dealBreakers: ollamaResult.deal_breakers,
      recommendation: ollamaResult.recommendation as Recommendation,
      coverLetter: ollamaResult.cover_letter ?? null,
    });

    await this.analysisRepository.save(analysis);

    job.status = JobStatus.ANALYZED;
    await this.jobRepository.save(job);

    this.logger.log(`Analysis saved for "${job.title}": score=${ollamaResult.fit_score}, recommendation=${ollamaResult.recommendation}`);
  }
}
