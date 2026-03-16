import { IsOptional, IsString, IsUUID } from "class-validator";

export class CertificationDto {

  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  certificateUrl?: string;
}