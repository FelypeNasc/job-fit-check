import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JobStatus } from '@jobfitcheck/shared';
import { Job } from './entities/job.entity';
import { JobAnalysis } from './entities/job-analysis.entity';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobAnalysis)
    private readonly analysisRepository: Repository<JobAnalysis>,
  ) {}

  async findAll(query: ListJobsQueryDto): Promise<{ data: Job[]; meta: { total: number; page: number; limit: number } }> {
    const { page, limit, status, recommendation, minScore, search } = query;

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.analysis', 'analysis')
      .orderBy('analysis.fitScore', 'DESC', 'NULLS LAST')
      .addOrderBy('job.createdAt', 'DESC');

    if (status) {
      qb.andWhere('job.status = :status', { status });
    }

    if (recommendation) {
      qb.andWhere('analysis.recommendation = :recommendation', { recommendation });
    }

    if (minScore !== undefined) {
      qb.andWhere('analysis.fit_score >= :minScore', { minScore });
    }

    if (search) {
      qb.andWhere('(LOWER(job.title) LIKE :search OR LOWER(job.company) LIKE :search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['analysis'],
    });

    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }

    return job;
  }

  async updateStatus(id: string, dto: UpdateJobStatusDto): Promise<Job> {
    const job = await this.findOne(id);
    job.status = dto.status;
    return this.jobRepository.save(job);
  }

  async findPendingJobs(): Promise<Job[]> {
    return this.jobRepository.find({ where: { status: JobStatus.PENDING_ANALYSIS } });
  }

  async deleteMany(ids: string[]): Promise<{ deleted: number }> {
    await this.analysisRepository.delete({ job: { id: In(ids) } });
    await this.jobRepository.delete({ id: In(ids) });
    return { deleted: ids.length };
  }
}
