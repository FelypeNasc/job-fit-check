import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coreStack?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryStack?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notExperiencedWith?: string[];

  @IsOptional()
  @IsString()
  targetRoles?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}
