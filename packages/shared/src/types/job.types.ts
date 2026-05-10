import { JobStatus } from '../enums/job-status.enum.js';

export interface Job {
  id: string;
  linkedinId: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  url: string;
  isEasyApply: boolean;
  postedAt: Date | null;
  status: JobStatus;
  createdAt: Date;
}

export interface ScrapedJob {
  linkedinId: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  url: string;
  isEasyApply: boolean;
  postedAt: Date | null;
}
