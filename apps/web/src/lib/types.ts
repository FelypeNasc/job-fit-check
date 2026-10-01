import type { Job, JobAnalysis, CandidateProfile } from '@jobfitcheck/shared';

export type JobWithAnalysis = Job & { analysis: JobAnalysis | null };

export interface JobsListResponse {
  data: JobWithAnalysis[];
  meta: { total: number; page: number; limit: number };
}

export interface JobDetailResponse {
  data: JobWithAnalysis;
}

export interface ProfileResponse {
  data: CandidateProfile;
}

export type { JobAnalysis, CandidateProfile };
