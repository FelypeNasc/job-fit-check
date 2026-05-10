import { Page } from 'playwright';
import { createInterface } from 'readline';
import { CONFIG } from '../config.js';
import { logger } from '../utils/logger.js';
import { randomBetween, delay } from '@job-analyzer/shared';
import { SELECTORS } from '../scraping/selectors.js';

async function typeSlowly(page: Page, selector: string, text: string): Promise<void> {
  await page.click(selector);
  for (const char of text) {
    await page.keyboard.type(char);
    await delay(randomBetween(50, 150));
  }
}

async function waitForManualIntervention(prompt: string): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log(`\n>>> ${prompt}`);
    rl.question('>>> Press ENTER when done: ', () => {
      rl.close();
      resolve();
    });
  });
}

async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    logger.info('LOGIN', 'Checking if already authenticated...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const url = page.url();
    return !url.includes('/login') && !url.includes('/uas/login') && !url.includes('/checkpoint');
  } catch {
    return false;
  }
}

export async function login(page: Page): Promise<void> {
  if (await isLoggedIn(page)) {
    logger.info('LOGIN', 'Already authenticated via cookies');
    return;
  }

  if (!CONFIG.LINKEDIN_EMAIL || !CONFIG.LINKEDIN_PASSWORD) {
    throw new Error('LINKEDIN_EMAIL and LINKEDIN_PASSWORD must be set in .env');
  }

  logger.info('LOGIN', 'Navigating to LinkedIn login page...');
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

  logger.info('LOGIN', 'Typing email...');
  await page.waitForSelector(SELECTORS.LOGIN_EMAIL, { timeout: 10000 });
  await typeSlowly(page, SELECTORS.LOGIN_EMAIL, CONFIG.LINKEDIN_EMAIL);

  logger.info('LOGIN', 'Typing password...');
  await typeSlowly(page, SELECTORS.LOGIN_PASSWORD, CONFIG.LINKEDIN_PASSWORD);

  logger.info('LOGIN', 'Clicking sign in...');
  await page.click(SELECTORS.LOGIN_SUBMIT);

  // Wait for navigation result
  await page.waitForTimeout(3000);
  const url = page.url();

  if (url.includes('/checkpoint') || url.includes('/challenge') || url.includes('/2fa') || url.includes('verification')) {
    await waitForManualIntervention(
      'LinkedIn is asking for verification (CAPTCHA or 2FA). Complete it in the browser window.',
    );
  }

  // Verify we ended up on feed
  await page.waitForURL('**/feed/**', { timeout: 30000 });
  logger.info('LOGIN', 'Login successful');
}
