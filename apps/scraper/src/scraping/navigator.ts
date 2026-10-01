import { Page } from 'playwright';
import { CONFIG } from '../config.js';
import { logger } from '../utils/logger.js';
import { SELECTORS } from './selectors.js';
import { randomDelay } from '@jobfitcheck/shared';

export function buildSearchUrl(startOffset = 0): string {
  const params = new URLSearchParams({
    keywords: CONFIG.SEARCH.keywords,
    location: CONFIG.SEARCH.location,
    f_WT: CONFIG.SEARCH.workplaceType,
    f_TPR: CONFIG.SEARCH.timePosted,
    f_E: CONFIG.SEARCH.experienceLevel,
    sortBy: CONFIG.SEARCH.sortBy,
    start: String(startOffset),
  });
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

export async function navigateToSearch(page: Page, url: string): Promise<void> {
  logger.info('NAVIGATE', `Opening jobs search: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
}

export async function scrollJobsList(page: Page): Promise<void> {
  const container = await page.$(SELECTORS.JOBS_LIST_SCROLL);
  if (!container) return;

  logger.info('SCROLL', 'Scrolling job list to load all cards...');
  for (let i = 0; i < 8; i++) {
    await container.evaluate((el) => (el.scrollTop += 400));
    await page.waitForTimeout(600);
  }
  // Scroll back to top so we can click from the beginning
  await container.evaluate((el) => (el.scrollTop = 0));
}

export async function hasNoResults(page: Page): Promise<boolean> {
  const noResults = await page.$(SELECTORS.NO_RESULTS);
  return noResults !== null;
}

export async function goToNextPage(page: Page, currentOffset: number): Promise<boolean> {
  const nextOffset = currentOffset + 25;
  const url = buildSearchUrl(nextOffset);
  logger.info('NAVIGATE', `Going to next page (offset ${nextOffset})...`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await randomDelay(2000, 4000);

  if (await hasNoResults(page)) {
    logger.info('NAVIGATE', 'No more results — stopping pagination');
    return false;
  }
  return true;
}
