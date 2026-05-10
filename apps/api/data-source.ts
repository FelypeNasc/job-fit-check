import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// pnpm sets cwd to apps/api — .env is two levels up at repo root
config({ path: resolve(process.cwd(), '../../.env') });

import { Job } from './src/jobs/entities/job.entity';
import { JobAnalysis } from './src/jobs/entities/job-analysis.entity';
import { CreateJobsTables1746000000000 } from './src/migrations/1746000000000-CreateJobsTables';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'job_analyzer',
  entities: [Job, JobAnalysis],
  migrations: [CreateJobsTables1746000000000],
  synchronize: false,
  logging: true,
});

export default AppDataSource;

// Run migrations when this file is executed directly via: tsx data-source.ts
const isMain = process.argv[1]?.endsWith('data-source.ts');
if (isMain) {
  AppDataSource.initialize()
    .then(() => AppDataSource.runMigrations())
    .then((migrations) => {
      console.log(`Ran ${migrations.length} migration(s):`, migrations.map((m) => m.name));
      return AppDataSource.destroy();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
