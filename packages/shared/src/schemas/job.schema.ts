import { z } from 'zod';

export const ScrapedJobSchema = z.object({
  linkedinId: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().nullable(),
  description: z.string().min(20),
  url: z.string().url(),
  isEasyApply: z.boolean(),
  postedAt: z.date().nullable(),
});

export type ScrapedJobInput = z.infer<typeof ScrapedJobSchema>;

export const OllamaResponseSchema = z.object({
  fit_score: z.number().int().min(0).max(100),
  matching_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  location_compatible: z.boolean(),
  level_match: z.enum(['under', 'match', 'over']),
  summary: z.string().min(1),
  deal_breakers: z.array(z.string()),
  recommendation: z.enum(['apply', 'maybe', 'skip']),
  cover_letter: z.string().optional(),
});

export type OllamaResponseInput = z.infer<typeof OllamaResponseSchema>;
