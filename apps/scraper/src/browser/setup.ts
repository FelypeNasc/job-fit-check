import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { logger } from '../utils/logger.js';

export interface BrowserSetup {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export async function setupBrowser(): Promise<BrowserSetup> {
  logger.info('BROWSER', 'Launching Chromium (headless=false)');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/Sao_Paulo',
  });

  const page = await context.newPage();

  return { browser, context, page };
}
