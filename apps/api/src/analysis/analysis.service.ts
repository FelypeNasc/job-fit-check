import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobStatus } from '@jobfitcheck/shared';
import { Job } from '../jobs/entities/job.entity';
import { AnalysisGateway } from './analysis.gateway';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectQueue('job-analysis') private readonly analysisQueue: Queue,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    private readonly gateway: AnalysisGateway,
  ) {}

  async queueJob(jobId: string): Promise<void> {
    await this.analysisQueue.add(
      'analyze',
      { jobId },
      { removeOnComplete: true, removeOnFail: 50 },
    );
    this.gateway.notifyQueued(1);
  }

  async queueAllPending(): Promise<number> {
    const pending = await this.jobRepository.find({
      where: { status: JobStatus.PENDING_ANALYSIS },
    });

    for (const job of pending) {
      await this.analysisQueue.add(
        'analyze',
        { jobId: job.id },
        { removeOnComplete: true, removeOnFail: 50 },
      );
    }

    if (pending.length > 0) {
      this.gateway.notifyQueued(pending.length);
    }

    return pending.length;
  }

  async queueAll(): Promise<number> {
    const jobs = await this.jobRepository.find({ select: ['id'] });

    for (const job of jobs) {
      await this.analysisQueue.add(
        'analyze',
        { jobId: job.id },
        { removeOnComplete: true, removeOnFail: 50 },
      );
    }

    if (jobs.length > 0) {
      this.gateway.notifyQueued(jobs.length);
    }

    return jobs.length;
  }
}
