interface ExtractProfilePrompt {
  system: string;
  user: string;
}

export function buildExtractProfilePrompt(rawText: string): ExtractProfilePrompt {
  const system = `You are a resume parser. Given raw text extracted from a resume or CV, extract the candidate's professional profile and respond ONLY with valid JSON.
No markdown, no code fences, no explanation — raw JSON only.

Respond with this exact JSON structure:
{
  "name": "<full name>",
  "location": "<city, country>",
  "level": "<Junior | Mid-level | Senior | Lead>",
  "coreStack": ["<primary tech 1>", "<primary tech 2>"],
  "secondaryStack": ["<secondary tech 1>", "<secondary tech 2>"],
  "notExperiencedWith": ["<tech not in resume>"],
  "targetRoles": "<brief description of target roles, e.g. Remote Backend or Fullstack>",
  "languages": ["<language (proficiency)>"]
}

Rules:
- coreStack: technologies prominently featured or used in most roles
- secondaryStack: technologies mentioned but not primary
- notExperiencedWith: infer from context if the resume explicitly states no experience, or leave as empty array
- targetRoles: infer from job titles, summary, or objective section
- languages: spoken/written languages with proficiency levels`;

  const user = `## Resume Text

${rawText}

## Task

Extract the candidate profile from the resume above. Respond with valid JSON only.`;

  return { system, user };
}
