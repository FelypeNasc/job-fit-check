import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { JobStatus, Recommendation } from '@jobfitcheck/shared';

export class ListJobsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(Recommendation)
  recommendation?: Recommendation;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
