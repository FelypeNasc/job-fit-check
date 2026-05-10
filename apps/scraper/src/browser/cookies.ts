import { BrowserContext } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { CONFIG } from '../config.js';
import { logger } from '../utils/logger.js';

export async function loadCookies(context: BrowserContext): Promise<void> {
  if (!existsSync(CONFIG.COOKIES_PATH)) {
    logger.info('COOKIES', 'No cookies.json found — will require login');
    return;
  }

  try {
    const raw = readFileSync(CONFIG.COOKIES_PATH, 'utf-8');
    const cookies = JSON.parse(raw);
    await context.addCookies(cookies);
    logger.info('COOKIES', `Loaded ${cookies.length} cookies from disk`);
  } catch (err) {
    logger.warn('COOKIES', `Failed to load cookies: ${err}`);
  }
}

export async function saveCookies(context: BrowserContext): Promise<void> {
  try {
    const cookies = await context.cookies();
    writeFileSync(CONFIG.COOKIES_PATH, JSON.stringify(cookies, null, 2));
    logger.info('COOKIES', `Saved ${cookies.length} cookies to disk`);
  } catch (err) {
    logger.warn('COOKIES', `Failed to save cookies: ${err}`);
  }
}
