import { IsEnum } from 'class-validator';
import { JobStatus } from '@job-analyzer/shared';

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  status: JobStatus;
}
