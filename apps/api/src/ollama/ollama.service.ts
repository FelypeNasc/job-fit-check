import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OllamaResponseSchema, OllamaResponseInput, ExtractedProfileSchema, ExtractedProfileInput, buildAnalyzeJobPrompt, buildExtractProfilePrompt, CandidateProfile } from '@jobfitcheck/shared';

interface JobForAnalysis {
  title: string;
  company: string;
  location: string | null;
  description: string;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.model = this.configService.get('OLLAMA_MODEL', 'llama3.1:8b');
  }

  async analyzeJob(profile: CandidateProfile, job: JobForAnalysis): Promise<OllamaResponseInput> {
    return this.callWithRetry(profile, job, 3);
  }

  async extractProfile(rawText: string): Promise<ExtractedProfileInput> {
    const { system, user } = buildExtractProfilePrompt(rawText);
    let lastError: Error | undefined;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`Extracting profile from CV (attempt ${attempt}/${maxAttempts})`);

        const response = await firstValueFrom(
          this.httpService.post('/api/generate', {
            model: this.model,
            system,
            prompt: user,
            stream: false,
            format: 'json',
          }),
        );

        const raw: string = response.data?.response ?? '';
        const cleaned = this.extractJson(raw);
        const parsed = JSON.parse(cleaned) as unknown;
        const validated = ExtractedProfileSchema.parse(parsed);

        this.logger.log('Profile extraction complete');
        return validated;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(`Attempt ${attempt} failed for profile extraction: ${lastError.message}`);

        if (attempt < maxAttempts) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw new Error(`Profile extraction failed after ${maxAttempts} attempts: ${lastError?.message}`);
  }

  private async callWithRetry(
    profile: CandidateProfile,
    job: JobForAnalysis,
    maxAttempts: number,
  ): Promise<OllamaResponseInput> {
    const { system, user } = buildAnalyzeJobPrompt(profile, job);
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`Calling Ollama for "${job.title}" at ${job.company} (attempt ${attempt}/${maxAttempts})`);

        const response = await firstValueFrom(
          this.httpService.post('/api/generate', {
            model: this.model,
            system,
            prompt: user,
            stream: false,
            format: 'json',
          }),
        );

        const raw: string = response.data?.response ?? '';
        const cleaned = this.extractJson(raw);
        const parsed = JSON.parse(cleaned) as unknown;
        const validated = OllamaResponseSchema.parse(parsed);

        this.logger.log(`Analysis complete for "${job.title}": fit_score=${validated.fit_score}`);
        return validated;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(`Attempt ${attempt} failed for "${job.title}": ${lastError.message}`);

        if (attempt < maxAttempts) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          this.logger.log(`Retrying in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw new Error(`Ollama analysis failed after ${maxAttempts} attempts: ${lastError?.message}`);
  }

  private extractJson(raw: string): string {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      return fenceMatch[1].trim();
    }
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      return raw.slice(firstBrace, lastBrace + 1);
    }
    return raw.trim();
  }
}
