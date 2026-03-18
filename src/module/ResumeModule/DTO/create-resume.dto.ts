// create-resume.dto.ts
import { IsString, IsOptional } from "class-validator";

export class CreateResumeDto {

  @IsString()
  jobTitle: string;

  @IsString()
  companyName: string;

  @IsString()
  jobDescription: string;

  @IsOptional()
  @IsString()
  template?: string; 
}