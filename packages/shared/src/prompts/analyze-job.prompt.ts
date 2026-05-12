import { CandidateProfile } from '../types/candidate-profile.types.js';

interface JobInput {
  title: string;
  company: string;
  location: string | null;
  description: string;
}

interface AnalyzeJobPrompt {
  system: string;
  user: string;
}

export function buildAnalyzeJobPrompt(
  profile: CandidateProfile,
  job: JobInput,
): AnalyzeJobPrompt {
  const system = `You are a senior technical recruiter and job fit analyzer.
Given a candidate profile and a job description, analyze the compatibility and respond ONLY with valid JSON.
No markdown, no code fences, no explanation — raw JSON only.

Scoring weights:
- Stack match: 40%
- Level match: 25%
- Location compatibility: 20%
- Domain relevance: 15%

The "summary" field MUST be written in Brazilian Portuguese (pt-BR).
The "cover_letter" field MUST be written in English.

Respond with this exact JSON structure:
{
  "fit_score": <integer 0-100>,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "location_compatible": <true|false>,
  "level_match": "<under|match|over>",
  "summary": "<2-3 sentences in Portuguese analyzing the fit>",
  "deal_breakers": ["<any hard blockers, empty array if none>"],
  "recommendation": "<apply|maybe|skip>",
  "cover_letter": "<cover letter in English, 3-4 paragraphs>"
}`;

  const coreStack = profile.coreStack.join(', ');
  const secondaryStack = profile.secondaryStack.join(', ');
  const notExperienced = profile.notExperiencedWith.join(', ');
  const languages = profile.languages.join(', ');

  const user = `## Candidate Profile

Name: ${profile.name}
Location: ${profile.location}
Level: ${profile.level}
Core Stack: ${coreStack}
Secondary Skills: ${secondaryStack}
Not Experienced With: ${notExperienced}
Target Roles: ${profile.targetRoles}
Languages: ${languages}

## Job Posting

Title: ${job.title}
Company: ${job.company}
Location: ${job.location ?? 'Not specified'}

Description:
${job.description}

## Task

Analyze the fit between this candidate and this job posting. Respond with valid JSON only.`;

  return { system, user };
}
