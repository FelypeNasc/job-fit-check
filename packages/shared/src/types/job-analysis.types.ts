import { LevelMatch } from '../enums/level-match.enum.js';
import { Recommendation } from '../enums/recommendation.enum.js';

export interface JobAnalysis {
  id: string;
  jobId: string;
  fitScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  locationOk: boolean;
  levelMatch: LevelMatch;
  summary: string;
  coverLetter: string | null;
  dealBreakers: string[];
  recommendation: Recommendation;
  analyzedAt: Date;
}

export interface OllamaAnalysisResponse {
  fit_score: number;
  matching_skills: string[];
  missing_skills: string[];
  location_compatible: boolean;
  level_match: string;
  summary: string;
  deal_breakers: string[];
  recommendation: string;
  cover_letter?: string;
}
