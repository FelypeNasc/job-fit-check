import { config } from 'dotenv';
import { resolve } from 'path';
// pnpm sets cwd to apps/scraper when running scripts — .env is two levels up at repo root
config({ path: resolve(process.cwd(), '../../.env') });

export const CONFIG = {
  MAX_JOBS_PER_SESSION: 50,
  MIN_DELAY_MS: 3000,
  MAX_DELAY_MS: 8000,
  COOKIES_PATH: resolve(process.cwd(), 'cookies.json'),

  LINKEDIN_EMAIL: process.env.LINKEDIN_EMAIL || '',
  LINKEDIN_PASSWORD: process.env.LINKEDIN_PASSWORD || '',

  DATABASE: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'job_analyzer',
  },

  SEARCH: {
    keywords: '("backend software engineer" OR "backend developer") OR ("nodejs" or "node js" or "typescript") remote',
    location: 'Brazil',
    // f_WT: 2 = Remote, 1 = On-site, 3 = Hybrid
    workplaceType: '2',
    // sortBy: DD = date, R = relevance
    sortBy: 'DD',
    timePosted: 'r86400',
    // f_E: 3 = Associate, 4 = Mid-Senior
    experienceLevel: '4',
  },
} as const;
