import { IsOptional, IsString, IsUUID } from "class-validator";

export class ExperienceDto {

  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}