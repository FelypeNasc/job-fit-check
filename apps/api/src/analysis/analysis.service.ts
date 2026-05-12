import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobStatus } from '@job-analyzer/shared';
import { Job } from '../jobs/entities/job.entity';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectQueue('job-analysis') private readonly analysisQueue: Queue,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
  ) {}

  async queueJob(jobId: string): Promise<void> {
    await this.analysisQueue.add(
      'analyze',
      { jobId },
      { removeOnComplete: true, removeOnFail: 50 },
    );
  }

  async queueAllPending(): Promise<number> {
    const pending = await this.jobRepository.find({
      where: { status: JobStatus.PENDING_ANALYSIS },
    });

    for (const job of pending) {
      await this.queueJob(job.id);
    }

    return pending.length;
  }
}
