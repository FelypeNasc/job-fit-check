import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CONFIG } from '../config.js';

// Import entities from the API package via relative path.
// The scraper runs with tsx (no compile step), so cross-package relative imports work fine.
import { Job } from '../../../api/src/jobs/entities/job.entity.js';
import { JobAnalysis } from '../../../api/src/jobs/entities/job-analysis.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: CONFIG.DATABASE.host,
  port: CONFIG.DATABASE.port,
  username: CONFIG.DATABASE.username,
  password: CONFIG.DATABASE.password,
  database: CONFIG.DATABASE.database,
  entities: [Job, JobAnalysis],
  synchronize: false,
  logging: false,
});
