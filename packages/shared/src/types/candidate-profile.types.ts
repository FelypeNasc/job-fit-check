export interface CandidateProfile {
  id: string;
  name: string;
  location: string;
  level: string;
  coreStack: string[];
  secondaryStack: string[];
  notExperiencedWith: string[];
  targetRoles: string;
  languages: string[];
  updatedAt: Date;
}
