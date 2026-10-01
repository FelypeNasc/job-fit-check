import { IsEnum } from 'class-validator';
import { JobStatus } from '@jobfitcheck/shared';

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  status: JobStatus;
}
