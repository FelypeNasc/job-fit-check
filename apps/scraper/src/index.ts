import { AppDataSource } from './database/data-source.js';
import { setupBrowser } from './browser/setup.js';
import { loadCookies, saveCookies } from './browser/cookies.js';
import { login } from './browser/login.js';
import { buildSearchUrl, navigateToSearch, scrollJobsList, hasNoResults, goToNextPage } from './scraping/navigator.js';
import { extractJobsFromPage } from './scraping/extractor.js';
import { parseAllJobs } from './scraping/parser.js';
import { JobRepository } from './persistence/job-repository.js';
import { CONFIG } from './config.js';
import { logger } from './utils/logger.js';
import type { RawJobData } from './scraping/extractor.js';

async function main() {
  logger.info('SCRAPER', '=== LinkedIn Job Scraper starting ===');

  // 1. Connect to database
  logger.info('DB', 'Connecting to PostgreSQL...');
  await AppDataSource.initialize();
  logger.info('DB', 'Connected');

  const jobRepo = new JobRepository(AppDataSource);

  // 2. Launch browser
  const { browser, context, page } = await setupBrowser();

  try {
    // 3. Load cookies & login
    await loadCookies(context);
    await login(page);
    await saveCookies(context);

    // 4. Scrape with pagination
    const allRawJobs: RawJobData[] = [];
    let pageOffset = 0;

    while (allRawJobs.length < CONFIG.MAX_JOBS_PER_SESSION) {
      const url = buildSearchUrl(pageOffset);
      await navigateToSearch(page, url);

      if (await hasNoResults(page)) {
        logger.info('SCRAPER', 'No results found for search parameters');
        break;
      }

      await scrollJobsList(page);

      const pageJobs = await extractJobsFromPage(page);

      if (pageJobs.length === 0) {
        logger.info('SCRAPER', 'No jobs extracted from this page — stopping');
        break;
      }

      allRawJobs.push(...pageJobs);
      logger.info('PROGRESS', `Total extracted so far: ${allRawJobs.length}/${CONFIG.MAX_JOBS_PER_SESSION}`);

      if (allRawJobs.length >= CONFIG.MAX_JOBS_PER_SESSION) break;

      // Next page
      const hasNext = await goToNextPage(page, pageOffset);
      if (!hasNext) break;

      pageOffset += 25;
    }

    // 5. Trim to max
    const rawJobs = allRawJobs.slice(0, CONFIG.MAX_JOBS_PER_SESSION);
    logger.info('SCRAPER', `Processing ${rawJobs.length} extracted jobs...`);

    // 6. Parse & validate
    const validJobs = parseAllJobs(rawJobs);
    logger.info('PARSE', `Valid jobs after parsing: ${validJobs.length}/${rawJobs.length}`);

    // 7. Persist
    const result = await jobRepo.upsertMany(validJobs);
    logger.info('DB', `Done: ${result.inserted} inserted, ${result.updated} updated`);

    // 8. Save cookies before exit
    await saveCookies(context);
  } finally {
    logger.info('BROWSER', 'Closing browser...');
    await browser.close();
    await AppDataSource.destroy();
    logger.info('SCRAPER', '=== Scraper finished ===');
  }
}

main().catch((err) => {
  logger.error('SCRAPER', `Fatal error: ${err}`);
  process.exit(1);
});
