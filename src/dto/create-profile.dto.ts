import {
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

import { Type } from "class-transformer";

import { ExperienceDto } from "./experience.dto";
import { EducationDto } from "./education.dto";
import { ProjectDto } from "./project.dto";
import { CertificationDto } from "./certification.dto";
import { SkillDto } from "./skill.dto";

export class CreateProfileDto {

  // Personal Info

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  // Social Links

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  // Summary

  @IsOptional()
  @IsString()
  summary?: string;

  // Relations

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences?: ExperienceDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications?: CertificationDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];
}