import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber  , IsArray} from "class-validator";
import { JobType } from "src/common/enems/job-type.enum";

export class CreateJobDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsEnum(JobType)
    type: JobType;

    @IsOptional()
    @IsNumber()
    salaryMin?: number;

    @IsOptional()
    @IsNumber()
    salaryMax?: number;

    // 🔥 NEW
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];
}