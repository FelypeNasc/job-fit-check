import { DataSource, Repository } from 'typeorm';
import { Job } from '../../../api/src/jobs/entities/job.entity.js';
import { JobStatus } from '@job-analyzer/shared';
import type { ScrapedJobInput } from '@job-analyzer/shared';
import { logger } from '../utils/logger.js';

export class JobRepository {
  private repo: Repository<Job>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Job);
  }

  async upsertMany(jobs: ScrapedJobInput[]): Promise<{ inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;

    for (const job of jobs) {
      const existing = await this.repo.findOne({ where: { linkedinId: job.linkedinId } });

      if (existing) {
        // Update description/location but preserve status and other user-managed fields
        await this.repo.update(existing.id, {
          description: job.description,
          location: job.location,
          title: job.title,
          isEasyApply: job.isEasyApply,
        });
        logger.info('DB', `Updated: "${job.title}" at "${job.company}" (id: ${job.linkedinId})`);
        updated++;
      } else {
        await this.repo.save({
          linkedinId: job.linkedinId,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          url: job.url,
          isEasyApply: job.isEasyApply,
          postedAt: job.postedAt,
          status: JobStatus.PENDING_ANALYSIS,
        });
        logger.info('DB', `Inserted: "${job.title}" at "${job.company}" (id: ${job.linkedinId})`);
        inserted++;
      }
    }

    return { inserted, updated };
  }
}
