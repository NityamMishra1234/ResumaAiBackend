import { IsOptional, IsString, IsUUID } from "class-validator";

export class SkillDto {

  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;
}