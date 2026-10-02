import { IsOptional, IsString } from 'class-validator';

export class TriggerScraperDto {
  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  workplaceType?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  timePosted?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;
}
