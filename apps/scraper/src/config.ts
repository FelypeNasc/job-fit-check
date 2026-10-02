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
    database: process.env.DATABASE_NAME || 'job_fit_check',
  },

  SEARCH: {
    keywords: process.env.SCRAPER_KEYWORDS ?? '("backend software engineer" OR "backend developer") OR ("nodejs" or "node js" or "typescript") remote',
    location: process.env.SCRAPER_LOCATION ?? 'Brazil',
    // f_WT: 2 = Remote, 1 = On-site, 3 = Hybrid
    workplaceType: process.env.SCRAPER_WORKPLACE_TYPE ?? '2',
    // sortBy: DD = date, R = relevance
    sortBy: process.env.SCRAPER_SORT_BY ?? 'DD',
    timePosted: process.env.SCRAPER_TIME_POSTED ?? 'r86400',
    // f_E: 1 = Internship, 2 = Entry, 3 = Associate, 4 = Mid-Senior, 5 = Director, 6 = Executive
    experienceLevel: process.env.SCRAPER_EXPERIENCE_LEVEL ?? '4',
  },
};
