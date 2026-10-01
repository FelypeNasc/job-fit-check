import { Page, ElementHandle } from 'playwright';
import { logger } from '../utils/logger.js';
import { SELECTORS } from './selectors.js';
import { randomDelay } from '@jobfitcheck/shared';

export interface RawJobData {
  linkedinId: string;
  titleRaw: string;
  companyRaw: string;
  locationRaw: string | null;
  descriptionHtml: string;
  url: string;
  isEasyApply: boolean;
  postedAtRaw: string | null;
}

async function extractLinkedinId(card: ElementHandle): Promise<string | null> {
  // Try data-job-id attribute first
  const jobId = await card.getAttribute('data-job-id');
  if (jobId) return jobId;

  // Fallback: extract from card link href
  const link = await card.$(SELECTORS.JOB_CARD_LINK);
  if (!link) return null;
  const href = await link.getAttribute('href');
  if (!href) return null;
  const match = href.match(/\/jobs\/view\/(\d+)/);
  return match ? match[1] : null;
}

export async function extractJobsFromPage(page: Page): Promise<RawJobData[]> {
  const cards = await page.$$(SELECTORS.JOB_CARD);
  logger.info('EXTRACT', `Found ${cards.length} job cards on this page`);

  const results: RawJobData[] = [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    const linkedinId = await extractLinkedinId(card);
    if (!linkedinId) {
      logger.warn('EXTRACT', `Card ${i + 1}: could not extract LinkedIn ID — skipping`);
      continue;
    }

    // Get title preview from card (used for logging)
    const titlePreview = await card
      .$eval(SELECTORS.JOB_CARD_TITLE, (el) => el.textContent?.trim() ?? '')
      .catch(() => '');

    logger.info('CLICK', `Clicking card ${i + 1}/${cards.length}: "${titlePreview}" (id: ${linkedinId})`);

    try {
      await card.click();
      // Wait for detail panel to load
      await page.waitForSelector(SELECTORS.JOB_DETAIL_DESCRIPTION, { timeout: 10000 });
      await randomDelay(CONFIG_DELAY.MIN, CONFIG_DELAY.MAX);
    } catch (err) {
      logger.warn('EXTRACT', `Card ${i + 1}: detail panel did not load — skipping`);
      continue;
    }

    // Extract from detail panel
    const titleRaw = await page
      .$eval(SELECTORS.JOB_DETAIL_TITLE, (el) => el.textContent?.trim() ?? '')
      .catch(() => titlePreview);

    const companyRaw = await page
      .$eval(SELECTORS.JOB_DETAIL_COMPANY, (el) => el.textContent?.trim() ?? '')
      .catch(() => '');

    const locationRaw = await page
      .$eval(SELECTORS.JOB_DETAIL_LOCATION, (el) => el.textContent?.trim() ?? null)
      .catch(() => null);

    const descriptionHtml = await page
      .$eval(SELECTORS.JOB_DETAIL_DESCRIPTION, (el) => el.innerHTML)
      .catch(async () => page.$eval(SELECTORS.JOB_DETAIL_DESCRIPTION_TEXT, (el) => el.innerHTML).catch(() => ''));

    const isEasyApply = await page
      .$eval(SELECTORS.JOB_DETAIL_EASY_APPLY_BTN, (el) =>
        el.textContent?.toLowerCase().includes('easy apply') ?? false,
      )
      .catch(() => false);

    const postedAtRaw = await page
      .$eval(SELECTORS.JOB_DETAIL_POSTED_TIME, (el) => el.textContent?.trim() ?? null)
      .catch(async () =>
        page
          .$eval(SELECTORS.JOB_DETAIL_POSTED_TIME_ALT, (el) => el.textContent?.trim() ?? null)
          .catch(() => null),
      );

    const url = `https://www.linkedin.com/jobs/view/${linkedinId}/`;

    results.push({
      linkedinId,
      titleRaw,
      companyRaw,
      locationRaw,
      descriptionHtml,
      url,
      isEasyApply,
      postedAtRaw,
    });

    logger.info('EXTRACT', `Extracted: "${titleRaw}" at "${companyRaw}"`);
  }

  return results;
}

// Imported here to avoid circular dependency — delay constants
const CONFIG_DELAY = { MIN: 3000, MAX: 8000 };
