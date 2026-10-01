import { ScrapedJobSchema } from '@jobfitcheck/shared';
import type { ScrapedJobInput } from '@jobfitcheck/shared';
import { RawJobData } from './extractor.js';
import { logger } from '../utils/logger.js';

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parsePostedDate(raw: string | null): Date | null {
  if (!raw) return null;

  const text = raw.toLowerCase().trim();
  const now = new Date();

  const patterns: Array<[RegExp, (n: number) => Date]> = [
    [/(\d+)\s*minute/, (n) => new Date(now.getTime() - n * 60 * 1000)],
    [/(\d+)\s*hour/, (n) => new Date(now.getTime() - n * 60 * 60 * 1000)],
    [/(\d+)\s*day/, (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)],
    [/(\d+)\s*week/, (n) => new Date(now.getTime() - n * 7 * 24 * 60 * 60 * 1000)],
    [/(\d+)\s*month/, (n) => new Date(now.getTime() - n * 30 * 24 * 60 * 60 * 1000)],
    [/just now|moments? ago/, () => now],
    [/yesterday/, () => new Date(now.getTime() - 24 * 60 * 60 * 1000)],
  ];

  for (const [regex, compute] of patterns) {
    const match = text.match(regex);
    if (match) {
      const n = match[1] ? parseInt(match[1], 10) : 1;
      return compute(n);
    }
  }

  return null;
}

export function parseRawJob(raw: RawJobData): ScrapedJobInput {
  const description = stripHtml(raw.descriptionHtml);
  const location = raw.locationRaw?.trim() || null;
  const postedAt = parsePostedDate(raw.postedAtRaw);

  const data = {
    linkedinId: raw.linkedinId,
    title: raw.titleRaw.trim(),
    company: raw.companyRaw.trim(),
    location,
    description,
    url: raw.url,
    isEasyApply: raw.isEasyApply,
    postedAt,
  };

  // Zod validation — throws if invalid
  return ScrapedJobSchema.parse(data);
}

export function parseAllJobs(rawJobs: RawJobData[]): ScrapedJobInput[] {
  const valid: ScrapedJobInput[] = [];

  for (const raw of rawJobs) {
    try {
      valid.push(parseRawJob(raw));
    } catch (err) {
      logger.warn('PARSE', `Skipping job ${raw.linkedinId} (${raw.titleRaw}): ${err}`);
    }
  }

  return valid;
}
