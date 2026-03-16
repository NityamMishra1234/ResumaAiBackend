import { IsOptional, IsString, IsUUID } from "class-validator";

export class EducationDto {

  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}